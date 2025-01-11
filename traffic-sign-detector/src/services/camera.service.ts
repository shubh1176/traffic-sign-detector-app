import { Camera } from '@capacitor/camera';

export class CameraService {
  private static instance: CameraService;
  private stream: MediaStream | null = null;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async startStream(videoElement: HTMLVideoElement): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      videoElement.srcObject = this.stream;
      await videoElement.play();
    } catch (error) {
      console.error('Camera stream error:', error);
      throw error;
    }
  }

  async stopStream(): Promise<void> {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async captureFrame(videoElement: HTMLVideoElement): Promise<ImageData> {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(videoElement, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
} 