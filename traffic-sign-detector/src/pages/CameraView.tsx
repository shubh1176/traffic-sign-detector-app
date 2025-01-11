import {
  IonContent,
  IonHeader,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  IonProgressBar,
  IonToast,
  IonButton,
  IonSpinner,
} from '@ionic/react';
import { camera, flash, settingsOutline, flashOff } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { MLService } from '../services/ml.service';
import { ProcessingService } from '../services/processing.service';
import { CameraService } from '../services/camera.service';
import './CameraView.css';

const CameraView: React.FC = () => {
  const { settings } = useSettings();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prediction, setPrediction] = useState({ label: '', confidence: 0 });
  const mlService = MLService.getInstance();
  const processingService = ProcessingService.getInstance();
  const cameraService = CameraService.getInstance();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await mlService.loadModel();
        if (videoRef.current) {
          await cameraService.startStream(videoRef.current);
          await processingService.startProcessing(
            videoRef.current,
            (results) => {
              if (results.length > 0) {
                handlePrediction({
                  label: results[0].class,
                  confidence: results[0].confidence * 100
                });
              }
            },
            (err) => setError(err.message)
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize camera');
        console.error('Camera initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      cameraService.stopStream();
      processingService.stopProcessing();
    };
  }, [settings]);

  const handlePrediction = (result: { label: string; confidence: number }) => {
    setPrediction(result);
    if (result.confidence >= settings.detection.confidenceThreshold * 100) {
      setShowToast(true);
    }
  };

  if (error) {
    return (
      <IonPage>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <IonButton onClick={() => window.location.reload()}>
            Retry
          </IonButton>
        </div>
      </IonPage>
    );
  }

  if (isLoading) {
    return (
      <IonPage>
        <div className="loading-container">
          <IonSpinner />
          <p>Initializing camera...</p>
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage className="camera-page">
      <div className="camera-container">
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
          {prediction.confidence > 0 && (
            <div className="detection-box">
              <div className="detection-label">
                {prediction.label}
                <span className="confidence">{prediction.confidence.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Confidence Progress Bar */}
        <div className="confidence-bar-container">
          <IonProgressBar 
            value={prediction.confidence / 100}
            className={`confidence-bar ${prediction.confidence > 70 ? 'high' : prediction.confidence > 40 ? 'medium' : 'low'}`}
          />
        </div>

        {/* Controls */}
        <div className="camera-controls">
          {/* Flash Toggle */}
          <IonFab vertical="top" horizontal="start" slot="fixed">
            <IonFabButton 
              size="small" 
              className="control-button flash-button"
              onClick={() => setIsFlashOn(!isFlashOn)}
            >
              <IonIcon icon={isFlashOn ? flash : flashOff} />
            </IonFabButton>
          </IonFab>

          {/* Settings Button */}
          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton 
              size="small" 
              className="control-button settings-button"
              routerLink="/settings"
            >
              <IonIcon icon={settingsOutline} />
            </IonFabButton>
          </IonFab>

          {/* Capture Button */}
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton 
              className="capture-button"
              onClick={() => setShowToast(true)}
            >
              <IonIcon icon={camera} />
            </IonFabButton>
          </IonFab>
        </div>

        {/* Detection Result */}
        <div className="detection-result">
          <div className="result-card">
            <h2>Detected Sign</h2>
            <p className="sign-name">{prediction.label}</p>
            <div className="confidence-indicator">
              <div 
                className="confidence-level" 
                style={{ width: `${prediction.confidence}%` }}
              >
                {prediction.confidence.toFixed(1)}% Confidence
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Sign detected!"
          duration={2000}
          position="top"
          color="success"
          cssClass="detection-toast"
        />
      </div>
    </IonPage>
  );
};

export default CameraView; 