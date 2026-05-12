import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from ultralytics import YOLO
from config import Config
import os

class VisionAnalyzer:
    """Handles vision-based analysis using MobileNetV2 and YOLO"""
    
    def __init__(self):
        self.mobilenet = None
        self.yolo = None
        self._load_models()
    
    def _load_models(self):
        """Load pretrained models"""
        try:
            # Load MobileNetV2 for feature extraction
            self.mobilenet = MobileNetV2(
                weights='imagenet',
                include_top=False,
                pooling='avg',
                input_shape=(224, 224, 3)
            )
            print("✓ MobileNetV2 loaded successfully")
            
        except Exception as e:
            print(f"⚠ Warning: Could not load MobileNetV2: {e}")
            self.mobilenet = None
        
        try:
            # Load YOLO for object detection
            if os.path.exists(Config.YOLO_MODEL_PATH):
                self.yolo = YOLO(Config.YOLO_MODEL_PATH)
            else:
                # Download YOLOv8 nano model
                self.yolo = YOLO('yolov8n.pt')
            print("✓ YOLO model loaded successfully")
            
        except Exception as e:
            print(f"⚠ Warning: Could not load YOLO: {e}")
            self.yolo = None
    
    def extract_features(self, img_array):
        """
        Extract features using MobileNetV2
        
        Args:
            img_array: Normalized image array (512x512x3)
            
        Returns:
            dict with feature vector and metadata
        """
        if self.mobilenet is None:
            return {
                'success': False,
                'features': None,
                'error': 'MobileNetV2 model not available'
            }
        
        try:
            # Resize for MobileNetV2 (224x224)
            img_resized = tf.image.resize(img_array, (224, 224))
            
            # Preprocess for MobileNetV2
            img_preprocessed = preprocess_input(img_resized * 255.0)
            
            # Add batch dimension
            img_batch = np.expand_dims(img_preprocessed, axis=0)
            
            # Extract features
            features = self.mobilenet.predict(img_batch, verbose=0)
            
            return {
                'success': True,
                'features': features[0].tolist(),  # Convert to list for JSON serialization
                'feature_dim': len(features[0]),
                'error': None
            }
            
        except Exception as e:
            return {
                'success': False,
                'features': None,
                'error': f'Feature extraction failed: {str(e)}'
            }
    
    def detect_objects(self, image_path, confidence_threshold=0.5):
        """
        Detect objects using YOLO
        
        Args:
            image_path: Path to image file
            confidence_threshold: Minimum confidence for detections
            
        Returns:
            dict with detected objects
        """
        if self.yolo is None:
            return {
                'success': False,
                'objects': [],
                'error': 'YOLO model not available'
            }
        
        try:
            # Run inference
            results = self.yolo(image_path, verbose=False)
            
            # Parse results
            detected_objects = []
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    confidence = float(box.conf[0])
                    if confidence >= confidence_threshold:
                        class_id = int(box.cls[0])
                        class_name = result.names[class_id]
                        
                        detected_objects.append({
                            'object': class_name,
                            'confidence': round(confidence, 2),
                            'bbox': box.xyxy[0].tolist()
                        })
            
            # Filter for room-relevant objects
            relevant_objects = self._filter_relevant_objects(detected_objects)
            
            return {
                'success': True,
                'objects': relevant_objects,
                'total_detections': len(detected_objects),
                'error': None
            }
            
        except Exception as e:
            return {
                'success': False,
                'objects': [],
                'error': f'Object detection failed: {str(e)}'
            }
    
    def _filter_relevant_objects(self, objects):
        """Filter for furniture and room-relevant objects"""
        relevant_categories = {
            'bed', 'couch', 'chair', 'dining table', 'toilet', 'tv',
            'laptop', 'refrigerator', 'oven', 'sink', 'microwave',
            'book', 'clock', 'vase', 'potted plant', 'cabinet'
        }
        
        return [
            obj for obj in objects 
            if obj['object'].lower() in relevant_categories
        ]
    
    def analyze_lighting(self, img_array):
        """Analyze lighting conditions"""
        # Calculate lighting metrics
        mean_brightness = np.mean(img_array)
        std_brightness = np.std(img_array)
        
        # Determine lighting quality
        if mean_brightness < 0.3:
            lighting_quality = 'dark'
        elif mean_brightness > 0.7:
            lighting_quality = 'bright'
        else:
            lighting_quality = 'moderate'
        
        return {
            'mean_brightness': float(mean_brightness),
            'std_brightness': float(std_brightness),
            'quality': lighting_quality
        }
