import tensorflow as tf
import numpy as np
import os
import cv2
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
import tensorflowjs as tfjs
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def load_dataset(dataset_path):
    """Load and preprocess the GTSRB dataset."""
    print("Loading dataset...")
    images = []
    labels = []
    
    for class_id in range(43):
        class_path = os.path.join(dataset_path, 'Training', str(class_id))
        print(f"Loading class {class_id}...")
        
        if not os.path.exists(class_path):
            print(f"Warning: Path {class_path} does not exist")
            continue
            
        for image_name in os.listdir(class_path):
            if image_name.endswith('.ppm'):
                image_path = os.path.join(class_path, image_name)
                try:
                    img = cv2.imread(image_path)
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    img = cv2.resize(img, (32, 32))
                    images.append(img)
                    labels.append(class_id)
                except Exception as e:
                    print(f"Error loading image {image_path}: {e}")
    
    return np.array(images), np.array(labels)

def create_model():
    """Create the CNN model architecture matching the 97% accuracy model."""
    print("Creating model...")
    model = models.Sequential([
        # First Convolutional Block
        layers.Conv2D(32, (5,5), activation='relu', input_shape=(32, 32, 3)),
        layers.Conv2D(32, (5,5), activation='relu'),
        layers.MaxPool2D(pool_size=(2, 2)),
        layers.Dropout(0.25),
        
        # Second Convolutional Block
        layers.Conv2D(64, (3,3), activation='relu'),
        layers.Conv2D(64, (3,3), activation='relu'),
        layers.MaxPool2D(pool_size=(2, 2)),
        layers.Dropout(0.25),
        
        # Third Convolutional Block
        layers.Conv2D(128, (3,3), activation='relu'),
        layers.Conv2D(128, (3,3), activation='relu'),
        layers.MaxPool2D(pool_size=(2, 2)),
        layers.Dropout(0.25),
        
        # Dense Layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(43, activation='softmax')  # 43 classes
    ])
    
    return model

def train_model(dataset_path):
    """Train the model with data augmentation and optimal parameters."""
    # Load and preprocess data
    images, labels = load_dataset(dataset_path)
    images = images.astype('float32') / 255.0
    
    # Split dataset
    X_train, X_val, y_train, y_val = train_test_split(
        images, labels, test_size=0.2, random_state=42
    )
    
    # Data Augmentation
    datagen = ImageDataGenerator(
        rotation_range=10,
        zoom_range=0.1,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=False,
        fill_mode='nearest'
    )
    
    # Create and compile model
    model = create_model()
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Training callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy',
            factor=0.2,
            patience=3,
            min_lr=1e-7
        ),
        tf.keras.callbacks.ModelCheckpoint(
            'checkpoints/model_{epoch:02d}_{val_accuracy:.3f}.h5',
            monitor='val_accuracy',
            save_best_only=True
        )
    ]
    
    # Create checkpoints directory
    os.makedirs('checkpoints', exist_ok=True)
    
    print("Starting training...")
    # Train with data augmentation
    history = model.fit(
        datagen.flow(X_train, y_train, batch_size=32),
        epochs=30,  # Reduced epochs with better stopping criteria
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=1
    )
    
    return model, history

def save_model(model):
    """Save the model in both Keras and TensorFlow.js formats."""
    print("Saving model...")
    # Save Keras model
    model.save('traffic_sign_model.h5')
    
    # Save for TensorFlow.js
    tfjs_target_dir = '../src/assets/model'
    os.makedirs(tfjs_target_dir, exist_ok=True)
    tfjs.converters.save_keras_model(model, tfjs_target_dir)
    
    print("Model saved successfully")

def main():
    """Main execution function."""
    print("Starting traffic sign recognition model training...")
    
    # Set random seeds for reproducibility
    tf.random.set_seed(42)
    np.random.seed(42)
    
    # Train model
    dataset_path = '../dataset'
    model, history = train_model(dataset_path)
    
    # Save model
    save_model(model)
    
    print("Training completed successfully!")
    return model, history

if __name__ == "__main__":
    main() 