import numpy as np
from config import Config

class ImagePreprocessor:
    """Handles image preprocessing and validation"""
    
    def __init__(self):
        self.target_size = Config.IMAGE_SIZE
        self.min_brightness = Config.MIN_BRIGHTNESS_THRESHOLD
        self.max_blur = Config.MAX_BLUR_THRESHOLD
    
    def preprocess(self, image_path):
        """
        Main preprocessing pipeline
        
        Args:
            image_path: Path to the input image
            
        Returns:
            dict: {
                'success': bool,
                'image': preprocessed PIL Image or None,
                'array': numpy array or None,
                'errors': list of error messages
            }
        """
        errors = []
        
        try:
            # Load image
            from PIL import Image
            img = Image.open(image_path)
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Validate image quality (warnings only, not blocking)
            img_array = np.array(img)
            warnings = []
            
            # Check brightness
            brightness_ok, brightness_msg = self._check_brightness(img_array)
            if not brightness_ok:
                warnings.append(brightness_msg)
            
            # Check blur
            blur_ok, blur_msg = self._check_blur(img_array)
            if not blur_ok:
                warnings.append(blur_msg)
            
            # Resize image
            from PIL import Image
            img_resized = img.resize(self.target_size, Image.Resampling.LANCZOS)
            
            # Normalize pixel values
            img_normalized = np.array(img_resized).astype(np.float32) / 255.0
            
            return {
                'success': True,  # Always succeed - quality checks are warnings only
                'image': img_resized,
                'array': img_normalized,
                'errors': [],
                'warnings': warnings,
                'metadata': {
                    'original_size': img.size,
                    'processed_size': img_resized.size,
                    'brightness_score': self._get_brightness_score(img_array),
                    'blur_score': self._get_blur_score(img_array)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'image': None,
                'array': None,
                'errors': [f'Failed to process image: {str(e)}']
            }
    
    def _check_brightness(self, img_array):
        """Check if image is too dark"""
        brightness = self._get_brightness_score(img_array)
        if brightness < self.min_brightness:
            return False, f'Image is too dark (brightness: {brightness:.1f}). Please use a brighter image.'
        return True, ''
    
    def _get_brightness_score(self, img_array):
        """Calculate average brightness"""
        import cv2
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        return np.mean(gray)
    
    def _check_blur(self, img_array):
        """Check if image is too blurry using Laplacian variance"""
        blur_score = self._get_blur_score(img_array)
        if blur_score < self.max_blur:
            return False, f'Image is too blurry (score: {blur_score:.1f}). Please use a clearer image.'
        return True, ''
    
    def _get_blur_score(self, img_array):
        """Calculate blur score using Laplacian variance"""
        import cv2
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return laplacian_var
    
    def get_lighting_histogram(self, img_array):
        """Generate lighting histogram for analysis"""
        import cv2
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        
        # Normalize histogram
        hist = hist.flatten() / hist.sum()
        
        return {
            'histogram': hist.tolist(),
            'mean': float(np.mean(gray)),
            'std': float(np.std(gray)),
            'median': float(np.median(gray))
        }
