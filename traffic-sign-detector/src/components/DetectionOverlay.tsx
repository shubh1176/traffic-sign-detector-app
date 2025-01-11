import React from 'react';
import { IonCard, IonCardContent, IonText, IonSpinner } from '@ionic/react';
import { DetectionResult } from '../services/ml.service';

interface DetectionOverlayProps {
  results: DetectionResult[];
  isProcessing: boolean;
  error?: Error;
}

const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  results,
  isProcessing,
  error
}) => {
  return (
    <div className="detection-overlay">
      {isProcessing && !error && results.length === 0 && (
        <div className="processing-indicator">
          <IonSpinner name="circular" />
          <IonText color="light">Processing...</IonText>
        </div>
      )}

      {error && (
        <IonCard color="danger" className="error-card">
          <IonCardContent>
            <IonText color="light">
              Error: {error.message}
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      {results.map((result, index) => (
        <IonCard key={index} className="result-card">
          <IonCardContent>
            <IonText color="primary">
              <h2>{result.class}</h2>
            </IonText>
            <IonText color="medium">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </IonText>
          </IonCardContent>
        </IonCard>
      ))}

      <style>
        {`
          .detection-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding: 1rem;
          }

          .processing-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: rgba(0, 0, 0, 0.5);
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            margin: 0 auto;
            width: fit-content;
          }

          .result-card {
            background: rgba(255, 255, 255, 0.9);
            margin-bottom: 0.5rem;
            border-radius: 1rem;
          }

          .error-card {
            background: rgba(var(--ion-color-danger-rgb), 0.9);
            margin-bottom: 0.5rem;
            border-radius: 1rem;
          }
        `}
      </style>
    </div>
  );
};

export default DetectionOverlay; 