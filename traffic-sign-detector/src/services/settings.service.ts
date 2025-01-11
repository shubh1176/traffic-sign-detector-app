export interface AppSettings {
  appearance: {
    darkMode: boolean;
  };
  camera: {
    resolution: {
      width: number;
      height: number;
    };
    frameRate: number;
    autoFlash: boolean;
    hdResolution: boolean;
    imageEnhancement: boolean;
  };
  detection: {
    confidenceThreshold: number;
    maxDetections: number;
    processingInterval: number;
    processingSpeed: 'fast' | 'balanced' | 'accurate';
  };
  accessibility: {
    ttsEnabled: boolean;
    language: string;
    notifications: boolean;
  };
  performance: {
    powerSaving: boolean;
  };
}

export class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings = {
    appearance: {
      darkMode: false
    },
    camera: {
      resolution: {
        width: 1280,
        height: 720
      },
      frameRate: 30,
      autoFlash: false,
      hdResolution: false,
      imageEnhancement: true
    },
    detection: {
      confidenceThreshold: 0.5,
      maxDetections: 3,
      processingInterval: 100,
      processingSpeed: 'balanced'
    },
    accessibility: {
      ttsEnabled: true,
      language: 'en',
      notifications: true
    },
    performance: {
      powerSaving: false
    }
  };

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
      camera: {
        ...this.settings.camera,
        ...(newSettings.camera || {})
      },
      detection: {
        ...this.settings.detection,
        ...(newSettings.detection || {})
      },
      accessibility: {
        ...this.settings.accessibility,
        ...(newSettings.accessibility || {})
      },
      appearance: {
        ...this.settings.appearance,
        ...(newSettings.appearance || {})
      },
      performance: {
        ...this.settings.performance,
        ...(newSettings.performance || {})
      }
    };
  }

  async saveSettings(): Promise<void> {
    try {
      await localStorage.setItem('appSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async loadSettings(): Promise<void> {
    try {
      const savedSettings = await localStorage.getItem('appSettings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
} 