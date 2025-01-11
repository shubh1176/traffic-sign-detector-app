import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import { settings, camera } from 'ionicons/icons';
import { CameraService } from '../services/camera.service';
import { ProcessingService } from '../services/processing.service';
import { DetectionResult } from '../services/ml.service';
import DetectionOverlay from '../components/DetectionOverlay';

const CameraPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<Error | undefined>();

  const cameraService = CameraService.getInstance();
  const processingService = ProcessingService.getInstance();

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      await cameraService.startStream(videoRef.current);
      setError(undefined);
    } catch (err) {
      setError(err as Error);
    }
  };

  const stopCamera = async () => {
    await cameraService.stopStream();
    processingService.stopProcessing();
    setIsProcessing(false);
    setResults([]);
    setError(undefined);
  };

  const toggleProcessing = async () => {
    if (!videoRef.current) return;

    if (!isProcessing) {
      setIsProcessing(true);
      await processingService.startProcessing(
        videoRef.current,
        (newResults) => {
          setResults(newResults);
          setError(undefined);
        },
        (err) => setError(err)
      );
    } else {
      processingService.stopProcessing();
      setIsProcessing(false);
      setResults([]);
    }
  };

  useIonViewDidEnter(() => {
    startCamera();
  });

  useIonViewDidLeave(() => {
    stopCamera();
  });

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Traffic Sign Detection</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/settings">
              <IonIcon icon={settings} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="camera-container">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="camera-preview"
          />
          <DetectionOverlay
            results={results}
            isProcessing={isProcessing}
            error={error}
          />
          <div className="camera-controls">
            <IonButton
              expand="block"
              onClick={toggleProcessing}
              color={isProcessing ? 'danger' : 'primary'}
            >
              <IonIcon icon={camera} slot="start" />
              {isProcessing ? 'Stop Detection' : 'Start Detection'}
            </IonButton>
          </div>
        </div>

        <style>
          {`
            .camera-container {
              position: relative;
              height: 100%;
              display: flex;
              flex-direction: column;
            }

            .camera-preview {
              flex: 1;
              width: 100%;
              height: 100%;
              object-fit: cover;
              background-color: black;
            }

            .camera-controls {
              position: absolute;
              bottom: 2rem;
              left: 50%;
              transform: translateX(-50%);
              width: 90%;
              max-width: 400px;
              z-index: 1000;
            }
          `}
        </style>
      </IonContent>
    </IonPage>
  );
};

export default CameraPage; 