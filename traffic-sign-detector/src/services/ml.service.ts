import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface DetectionSettings {
  confidenceThreshold: number;
  maxDetections: number;
}

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class MLService {
  private static instance: MLService;
  private model: tf.GraphModel | null = null;
  private isModelLoading = false;
  private readonly MODEL_URL = 'model/model.json';
  private readonly CLASSES = [
    'Speed limit (20km/h)', 'Speed limit (30km/h)', 'Speed limit (50km/h)',
    'Speed limit (60km/h)', 'Speed limit (70km/h)', 'Speed limit (80km/h)',
    'End of speed limit (80km/h)', 'Speed limit (100km/h)', 'Speed limit (120km/h)',
    'No passing', 'No passing for vehicles over 3.5 metric tons',
    'Right-of-way at the next intersection', 'Priority road', 'Yield', 'Stop',
    'No vehicles', 'Vehicles over 3.5 metric tons prohibited', 'No entry',
    'General caution', 'Dangerous curve to the left', 'Dangerous curve to the right',
    'Double curve', 'Bumpy road', 'Slippery road', 'Road narrows on the right',
    'Road work', 'Traffic signals', 'Pedestrians', 'Children crossing',
    'Bicycles crossing', 'Beware of ice/snow', 'Wild animals crossing',
    'End of all speed and passing limits', 'Turn right ahead', 'Turn left ahead',
    'Ahead only', 'Go straight or right', 'Go straight or left', 'Keep right',
    'Keep left', 'Roundabout mandatory', 'End of no passing',
    'End of no passing by vehicles over 3.5 metric tons'
  ];

  static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  async loadModel(): Promise<void> {
    if (this.model || this.isModelLoading) return;

    try {
      this.isModelLoading = true;
      await tf.ready();
      await tf.setBackend('webgl');
      this.model = await tf.loadGraphModel(this.MODEL_URL);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      this.isModelLoading = false;
    }
  }

  async processFrame(imageData: ImageData, settings: DetectionSettings): Promise<DetectionResult[]> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    const tensor = this.preprocessImage(imageData);
    
    try {
      const predictions = await this.model.predict(tensor) as tf.Tensor;
      const results = await this.postprocessPredictions(predictions, settings);
      tf.dispose([tensor, predictions]);
      return results;
    } catch (error) {
      tf.dispose(tensor);
      console.error('Prediction error:', error);
      throw error;
    }
  }

  private preprocessImage(imageData: ImageData): tf.Tensor {
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageData)
        .resizeBilinear([32, 32])
        .toFloat()
        .div(255.0)
        .expandDims(0);
      return tensor;
    });
  }

  private async postprocessPredictions(
    predictions: tf.Tensor,
    settings: DetectionSettings
  ): Promise<DetectionResult[]> {
    const probabilities = await predictions.data();
    const results: DetectionResult[] = [];

    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > settings.confidenceThreshold) {
        results.push({
          class: this.CLASSES[i],
          confidence: probabilities[i]
        });
      }
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results.slice(0, settings.maxDetections);
  }
} 