import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class for Residea.ai backend"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # Upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Image processing settings
    IMAGE_SIZE = (512, 512)
    MIN_BRIGHTNESS_THRESHOLD = 30
    MAX_BLUR_THRESHOLD = 100
    
    # Model paths
    MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
    MOBILENET_MODEL_PATH = os.path.join(MODELS_DIR, 'mobilenet_v2')
    YOLO_MODEL_PATH = os.path.join(MODELS_DIR, 'yolov8n.pt')
    
    # Cloud API settings
    IMAGE_GENERATION_API = os.getenv('IMAGE_GENERATION_API', 'gradio')  # gradio, stability, replicate
    GRADIO_HF_TOKEN = os.getenv('GRADIO_HF_TOKEN', '')
    STABILITY_API_KEY = os.getenv('STABILITY_API_KEY', '')
    REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN', '')
    
    # Room types and options
    SUPPORTED_ROOMS = ['kitchen', 'bedroom', 'living_room']
    RENOVATION_GOALS = ['modernize', 'refresh', 'luxury_upgrade', 'budget_friendly']
    BUDGET_TIERS = ['low', 'medium', 'high']
    STYLE_PREFERENCES = ['modern', 'traditional', 'minimalist', 'industrial', 'scandinavian']
    
    # Scoring weights
    IMPACT_WEIGHT = 0.4
    FEASIBILITY_WEIGHT = 0.3
    BUDGET_MATCH_WEIGHT = 0.3

# Create upload directory if it doesn't exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.MODELS_DIR, exist_ok=True)
