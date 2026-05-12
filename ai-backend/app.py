from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import traceback

from config import Config
from preprocessing import ImagePreprocessor
from vision_analysis import VisionAnalyzer
from multimodal_fusion import MultimodalFusion
from renovation_engine import RenovationEngine
from prompt_builder import PromptBuilder
from image_generator import ImageGenerator

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*"]}})

# Initialize components
preprocessor = ImagePreprocessor()
vision_analyzer = VisionAnalyzer()
fusion = MultimodalFusion()
renovation_engine = RenovationEngine()
prompt_builder = PromptBuilder()
image_generator = ImageGenerator()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Residea.ai Backend',
        'version': '1.0.0'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_and_generate():
    """
    Main endpoint: Analyze room image and generate renovation suggestions + visualization
    
    Expected form data:
    - image: file
    - room_type: string (kitchen, bedroom, living_room)
    - room_size: number (square feet)
    - property_age: number (years)
    - condition: string (excellent, good, fair, poor, very_poor)
    - goal: string (modernize, refresh, luxury_upgrade, budget_friendly)
    - budget_tier: string (low, medium, high)
    - style: string (modern, traditional, minimalist, industrial, scandinavian)
    """
    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Resize to 512x512 for consistent AI processing
        from PIL import Image
        img = Image.open(filepath).convert('RGB')
        img = img.resize((512, 512), Image.LANCZOS)
        img.save(filepath)
        
        # Extract metadata and preferences
        metadata = {
            'room_type': request.form.get('room_type', '').lower(),
            'room_size': request.form.get('room_size', 0),
            'property_age': int(request.form.get('property_age', 0)),
            'condition': request.form.get('condition', 'fair').lower(),
            'room_dimensions': {
                'length': float(request.form.get('room_length', 0) or 0),
                'width': float(request.form.get('room_width', 0) or 0),
                'height': float(request.form.get('room_height', 0) or 0),
            }
        }
        
        # Auto-calculate room_size from dimensions if not provided
        dims = metadata['room_dimensions']
        if dims['length'] > 0 and dims['width'] > 0:
            metadata['room_size'] = dims['length'] * dims['width']
        
        preferences = {
            'goal': request.form.get('goal', 'modernize').lower(),
            'budget_tier': request.form.get('budget_tier', 'medium').lower(),
            'style': request.form.get('style', 'modern').lower(),
            'custom_preferences': request.form.get('custom_preferences', '').strip()
        }
        
        # Validate inputs
        if metadata['room_type'] not in Config.SUPPORTED_ROOMS:
            return jsonify({'error': f'Invalid room type. Supported: {Config.SUPPORTED_ROOMS}'}), 400
        
        # PHASE 3: Preprocessing
        print("📸 Preprocessing image...")
        preprocess_result = preprocessor.preprocess(filepath)
        
        if not preprocess_result['success']:
            return jsonify({
                'error': 'Image quality issues',
                'details': preprocess_result['errors']
            }), 400
        
        # PHASE 4: Vision Analysis
        print("🔍 Analyzing image...")
        
        # Feature extraction
        features_result = vision_analyzer.extract_features(preprocess_result['array'])
        
        # Object detection
        objects_result = vision_analyzer.detect_objects(filepath)
        
        # Lighting analysis
        lighting_result = vision_analyzer.analyze_lighting(preprocess_result['array'])
        
        vision_data = {
            'features': features_result,
            'objects': objects_result,
            'lighting': lighting_result
        }
        
        # PHASE 5: Multimodal Fusion
        print("🔗 Fusing multimodal data...")
        context = fusion.create_context_vector(vision_data, metadata, preferences)
        
        if not context['is_valid']:
            return jsonify({'error': 'Invalid context data'}), 400
        
        context_summary = fusion.get_context_summary(context)
        
        # PHASE 6: Renovation Intelligence
        print("💡 Generating renovation suggestions...")
        suggestions = renovation_engine.generate_suggestions(context)
        
        # PHASE 7: Prompt Construction
        print("✍️ Building generation prompt...")
        prompt_data = prompt_builder.build_prompt(context, suggestions)
        
        # PHASE 8: Image Generation
        print("🎨 Generating renovated visualization...")
        generation_result = image_generator.generate(filepath, prompt_data)
        
        if not generation_result['success']:
            return jsonify({
                'error': 'Image generation failed',
                'details': generation_result['error']
            }), 500
        
        # PHASE 9: Post-Processing & Validation
        print("✅ Validating output...")
        is_valid, validation_msg = image_generator.validate_output(
            generation_result['generated_image_path']
        )
        
        if not is_valid:
            return jsonify({
                'error': 'Generated image validation failed',
                'details': validation_msg
            }), 500
        
        # PHASE 10: Output Assembly
        print("📦 Assembling final response...")
        
        response = {
            'success': True,
            'context_summary': context_summary,
            'suggestions': suggestions[:10],  # Top 10 suggestions
            'generated_image_url': f'/api/image/{os.path.basename(generation_result["generated_image_path"])}',
            'original_image_url': f'/api/image/{filename}',
            'prompt_used': prompt_builder.get_prompt_summary(prompt_data),
            'metadata': {
                'preprocessing': preprocess_result['metadata'],
                'objects_detected': len(objects_result.get('objects', [])),
                'is_mock_generation': generation_result.get('is_mock', False)
            }
        }
        
        if generation_result.get('is_mock'):
            response['warning'] = generation_result.get('message')
        
        print("✨ Pipeline complete!")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/image/<filename>', methods=['GET'])
def get_image(filename):
    """Serve uploaded or generated images"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='image/png')
        else:
            return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get available configuration options"""
    return jsonify({
        'supported_rooms': Config.SUPPORTED_ROOMS,
        'renovation_goals': Config.RENOVATION_GOALS,
        'budget_tiers': Config.BUDGET_TIERS,
        'style_preferences': Config.STYLE_PREFERENCES
    })

if __name__ == '__main__':
    print("🏠 Starting Residea.ai Backend...")
    print(f"📁 Upload folder: {Config.UPLOAD_FOLDER}")
    print(f"🤖 Models directory: {Config.MODELS_DIR}")
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)
