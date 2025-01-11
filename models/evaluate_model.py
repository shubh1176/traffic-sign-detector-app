import tensorflow as tf
import numpy as np
import cv2
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
import pandas as pd
from train_model import load_dataset

def plot_training_history(history):
    """Plot training & validation accuracy and loss values."""
    plt.figure(figsize=(12, 4))
    
    # Plot accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    
    # Plot loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('training_history.png')
    plt.close()

def plot_confusion_matrix(y_true, y_pred, classes):
    """Plot confusion matrix."""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(15, 15))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png')
    plt.close()

def evaluate_model(model_path, test_data_path):
    """Evaluate the trained model on test data."""
    print("Loading test data...")
    test_images, test_labels = load_dataset(test_data_path)
    test_images = test_images.astype('float32') / 255.0
    
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Evaluate
    print("\nEvaluating model...")
    test_loss, test_accuracy = model.evaluate(test_images, test_labels, verbose=1)
    print(f"\nTest accuracy: {test_accuracy*100:.2f}%")
    print(f"Test loss: {test_loss:.4f}")
    
    # Generate predictions
    predictions = model.predict(test_images)
    y_pred = np.argmax(predictions, axis=1)
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(test_labels, y_pred))
    
    # Plot confusion matrix
    plot_confusion_matrix(test_labels, y_pred, range(43))
    
    # Save detailed results
    results = {
        'accuracy': test_accuracy,
        'loss': test_loss,
        'predictions': y_pred.tolist(),
        'true_labels': test_labels.tolist()
    }
    
    return results

def test_single_image(model_path, image_path):
    """Test model on a single image."""
    # Load and preprocess image
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (32, 32))
    img = np.expand_dims(img, axis=0)
    img = img.astype('float32') / 255.0
    
    # Load model and predict
    model = tf.keras.models.load_model(model_path)
    prediction = model.predict(img)
    class_id = np.argmax(prediction[0])
    confidence = prediction[0][class_id]
    
    return class_id, confidence

if __name__ == "__main__":
    model_path = "traffic_sign_model.h5"
    test_data_path = "../dataset/Test"
    
    # Evaluate model
    results = evaluate_model(model_path, test_data_path)
    
    # Save results
    np.save('evaluation_results.npy', results) 