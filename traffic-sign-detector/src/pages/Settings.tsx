import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonButton,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import {
  volumeHigh,
  speedometer,
  flashlight,
  moon,
  language,
  notifications,
  videocam,
  colorPalette,
  batteryFull,
  camera,
  refresh,
} from 'ionicons/icons';
import { useSettings } from '../contexts/SettingsContext';
import { AppSettings } from '../services/settings.service';
import './Settings.css';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [presentToast] = useIonToast();

  const handleSettingChange = (newSettings: Partial<AppSettings>) => {
    updateSettings(newSettings);
    presentToast({
      message: 'Settings updated',
      duration: 1500,
      position: 'bottom',
      color: 'success'
    });
  };

  return (
    <IonPage className="settings-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => updateSettings({})}>
            <IonIcon slot="icon-only" icon={refresh} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="settings-container">
          <IonList className="settings-list">
            {/* Appearance */}
            <div className="settings-section">
              <h2>Appearance</h2>
              <IonItem>
                <IonIcon icon={moon} slot="start" />
                <IonLabel>Dark Mode</IonLabel>
                <IonToggle
                  checked={settings.appearance?.darkMode}
                  onIonChange={e => handleSettingChange({
                    appearance: { ...settings.appearance, darkMode: e.detail.checked }
                  })}
                />
              </IonItem>
            </div>

            {/* Camera Settings */}
            <div className="settings-section">
              <h2>Camera</h2>
              <IonItem>
                <IonIcon icon={camera} slot="start" />
                <IonLabel>Resolution</IonLabel>
                <IonRange
                  min={480}
                  max={1920}
                  step={160}
                  value={settings.camera.resolution.width}
                  onIonChange={e => handleSettingChange({
                    camera: {
                      ...settings.camera,
                      resolution: {
                        width: e.detail.value as number,
                        height: ((e.detail.value as number) * 9) / 16
                      }
                    }
                  })}
                >
                  <span slot="start">480p</span>
                  <span slot="end">1080p</span>
                </IonRange>
              </IonItem>

              <IonItem>
                <IonIcon icon={speedometer} slot="start" />
                <IonLabel>Frame Rate</IonLabel>
                <IonRange
                  min={15}
                  max={60}
                  step={15}
                  value={settings.camera.frameRate}
                  onIonChange={e => handleSettingChange({
                    camera: {
                      ...settings.camera,
                      frameRate: e.detail.value as number
                    }
                  })}
                >
                  <span slot="start">15fps</span>
                  <span slot="end">60fps</span>
                </IonRange>
              </IonItem>

              <IonItem>
                <IonIcon icon={flashlight} slot="start" />
                <IonLabel>Auto Flash</IonLabel>
                <IonToggle
                  checked={settings.camera.autoFlash}
                  onIonChange={e => handleSettingChange({
                    camera: { ...settings.camera, autoFlash: e.detail.checked }
                  })}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={videocam} slot="start" />
                <IonLabel>HD Resolution</IonLabel>
                <IonToggle
                  checked={settings.camera.hdResolution}
                  onIonChange={e => handleSettingChange({
                    camera: { ...settings.camera, hdResolution: e.detail.checked }
                  })}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={colorPalette} slot="start" />
                <IonLabel>Image Enhancement</IonLabel>
                <IonToggle
                  checked={settings.camera.imageEnhancement}
                  onIonChange={e => handleSettingChange({
                    camera: { ...settings.camera, imageEnhancement: e.detail.checked }
                  })}
                />
              </IonItem>
            </div>

            {/* Detection Settings */}
            <div className="settings-section">
              <h2>Detection</h2>
              <IonItem>
                <IonIcon icon={speedometer} slot="start" />
                <IonLabel>Confidence Threshold</IonLabel>
                <IonRange
                  min={0}
                  max={100}
                  value={settings.detection.confidenceThreshold * 100}
                  onIonChange={e => handleSettingChange({
                    detection: {
                      ...settings.detection,
                      confidenceThreshold: (e.detail.value as number) / 100
                    }
                  })}
                >
                  <span slot="start">0%</span>
                  <span slot="end">100%</span>
                </IonRange>
              </IonItem>

              <IonItem>
                <IonIcon icon={speedometer} slot="start" />
                <IonLabel>Processing Speed</IonLabel>
                <IonSelect
                  value={settings.detection.processingSpeed}
                  onIonChange={e => handleSettingChange({
                    detection: {
                      ...settings.detection,
                      processingSpeed: e.detail.value
                    }
                  })}
                >
                  <IonSelectOption value="fast">Fast (Lower Accuracy)</IonSelectOption>
                  <IonSelectOption value="balanced">Balanced</IonSelectOption>
                  <IonSelectOption value="accurate">Accurate (Slower)</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            {/* Accessibility */}
            <div className="settings-section">
              <h2>Accessibility</h2>
              <IonItem>
                <IonIcon icon={volumeHigh} slot="start" />
                <IonLabel>Text-to-Speech</IonLabel>
                <IonToggle
                  checked={settings.accessibility?.ttsEnabled}
                  onIonChange={e => handleSettingChange({
                    accessibility: { ...settings.accessibility, ttsEnabled: e.detail.checked }
                  })}
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={language} slot="start" />
                <IonLabel>Language</IonLabel>
                <IonSelect
                  value={settings.accessibility?.language}
                  onIonChange={e => handleSettingChange({
                    accessibility: { ...settings.accessibility, language: e.detail.value }
                  })}
                >
                  <IonSelectOption value="en">English</IonSelectOption>
                  <IonSelectOption value="es">Spanish</IonSelectOption>
                  <IonSelectOption value="fr">French</IonSelectOption>
                  <IonSelectOption value="de">German</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonIcon icon={notifications} slot="start" />
                <IonLabel>Notifications</IonLabel>
                <IonToggle
                  checked={settings.accessibility?.notifications}
                  onIonChange={e => handleSettingChange({
                    accessibility: { ...settings.accessibility, notifications: e.detail.checked }
                  })}
                />
              </IonItem>
            </div>

            {/* Performance */}
            <div className="settings-section">
              <h2>Performance</h2>
              <IonItem>
                <IonIcon icon={batteryFull} slot="start" />
                <IonLabel>Power Saving</IonLabel>
                <IonToggle
                  checked={settings.performance?.powerSaving}
                  onIonChange={e => handleSettingChange({
                    performance: { ...settings.performance, powerSaving: e.detail.checked }
                  })}
                />
              </IonItem>
            </div>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings; 