import { CameraService } from './camera.service';
import { MLService, DetectionResult } from './ml.service';
import { SettingsService } from './settings.service';

export class ProcessingService {
  private static instance: ProcessingService;
  private processing = false;
  private processingInterval: number | null = null;
  private readonly cameraService: CameraService;
  private readonly mlService: MLService;
  private readonly settingsService: SettingsService;

  constructor() {
    this.cameraService = CameraService.getInstance();
    this.mlService = MLService.getInstance();
    this.settingsService = SettingsService.getInstance();
  }

  static getInstance(): ProcessingService {
    if (!ProcessingService.instance) {
      ProcessingService.instance = new ProcessingService();
    }
    return ProcessingService.instance;
  }

  async startProcessing(
    videoElement: HTMLVideoElement,
    onResult: (results: DetectionResult[]) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (this.processing) return;

    try {
      await this.mlService.loadModel();
      this.processing = true;
      const settings = this.settingsService.getSettings();

      this.processingInterval = window.setInterval(async () => {
        if (!this.processing) return;

        try {
          const imageData = await this.cameraService.captureFrame(videoElement);
          const results = await this.mlService.processFrame(imageData, {
            confidenceThreshold: settings.detection.confidenceThreshold,
            maxDetections: settings.detection.maxDetections
          });
          onResult(results);
        } catch (error) {
          console.error('Processing error:', error);
          onError(error as Error);
        }
      }, settings.detection.processingInterval);
    } catch (error) {
      console.error('Failed to start processing:', error);
      onError(error as Error);
    }
  }

  stopProcessing(): void {
    this.processing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  isProcessing(): boolean {
    return this.processing;
  }
} 