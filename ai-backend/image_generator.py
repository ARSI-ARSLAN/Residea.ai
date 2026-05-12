import requests
import os
import base64
from config import Config
import io

class ImageGenerator:
    """Handles cloud-based image generation"""
    
    def __init__(self):
        self.api_type = Config.IMAGE_GENERATION_API
        self.stability_key = Config.STABILITY_API_KEY
        self.replicate_token = Config.REPLICATE_API_TOKEN
        self.gradio_token = Config.GRADIO_HF_TOKEN
    
    def generate(self, image_path, prompt_data):
        """
        Generate renovated image using cloud API
        
        Args:
            image_path: Path to original image
            prompt_data: dict with positive_prompt, negative_prompt, parameters
            
        Returns:
            dict with success status and generated image path or error
        """
        if self.api_type == 'gradio':
            return self._generate_gradio(image_path, prompt_data)
        elif self.api_type == 'stability':
            return self._generate_stability(image_path, prompt_data)
        elif self.api_type == 'replicate':
            return self._generate_replicate(image_path, prompt_data)
        else:
            # Fallback: return mock result for testing
            return self._generate_mock(image_path, prompt_data)
    
    def _generate_gradio(self, image_path, prompt_data):
        """Generate using Gradio StableDesign API"""
        if not self.gradio_token:
            return {
                'success': False,
                'error': 'Gradio HuggingFace token not configured',
                'generated_image_path': None
            }
        
        try:
            from gradio_client import Client, handle_file
            
            # Initialize Gradio client
            client = Client(
                "MykolaL/StableDesign",
                hf_token=self.gradio_token
            )
            
            # Prepare parameters
            positive_prompt = prompt_data['positive_prompt']
            negative_prompt = prompt_data['negative_prompt']
            strength = prompt_data['parameters']['strength']
            guidance_scale = prompt_data['parameters']['guidance_scale']
            num_steps = prompt_data['parameters']['num_inference_steps']
            
            print(f"🎨 Generating with Gradio StableDesign...")
            print(f"   Prompt: {positive_prompt[:100]}...")
            print(f"   Strength: {strength}, Steps: {num_steps}")
            
            # Adjust strength for better transformation
            # Much higher strength for room type conversion
            adjusted_strength = min(strength + 0.35, 0.95)
            
            print(f"   Adjusted Strength: {adjusted_strength}")
            
            # Call the API with optimized parameters
            result = client.predict(
                image=handle_file(image_path),
                text=positive_prompt,
                num_steps=num_steps,
                guidance_scale=guidance_scale,
                seed=42,  # Fixed seed for consistency
                strength=adjusted_strength,  # Use higher strength for conversion
                a_prompt="interior design transformation, 4K, high resolution, photorealistic, detailed, complete room makeover",
                n_prompt=f"{negative_prompt}, kitchen in bedroom, kitchen cabinets, kitchen appliances, countertops, backsplash",
                img_size=768,
                api_name="/on_submit"
            )
            
            # Result is a file path from Gradio
            if result and os.path.exists(result):
                # Copy to our uploads folder
                output_path = os.path.join(
                    Config.UPLOAD_FOLDER,
                    f"generated_{os.urandom(8).hex()}.png"
                )
                
                # Copy the generated image
                from PIL import Image
                img = Image.open(result)
                img.save(output_path)
                
                print(f"✅ Image generated successfully!")
                
                return {
                    'success': True,
                    'generated_image_path': output_path,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'error': 'No output from Gradio StableDesign',
                    'generated_image_path': None
                }
                
        except ImportError as e:
            print(f"❌ Import error: {str(e)}")
            print("   Falling back to mock generation...")
            return self._generate_mock(image_path, prompt_data)
        except Exception as e:
            print(f"❌ Gradio generation error: {str(e)}")
            print(f"   Error type: {type(e).__name__}")
            print(f"   Falling back to mock generation...")
            # Fallback to mock if Gradio fails
            return self._generate_mock(image_path, prompt_data)
    
    def _generate_stability(self, image_path, prompt_data):
        """Generate using Stability AI API"""
        if not self.stability_key:
            return {
                'success': False,
                'error': 'Stability AI API key not configured',
                'generated_image_path': None
            }
        
        try:
            # Prepare image
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # API endpoint
            url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image"
            
            # Prepare request
            headers = {
                "Authorization": f"Bearer {self.stability_key}",
                "Accept": "application/json"
            }
            
            files = {
                "init_image": image_data
            }
            
            data = {
                "text_prompts[0][text]": prompt_data['positive_prompt'],
                "text_prompts[0][weight]": 1,
                "text_prompts[1][text]": prompt_data['negative_prompt'],
                "text_prompts[1][weight]": -1,
                "cfg_scale": prompt_data['parameters']['guidance_scale'],
                "steps": prompt_data['parameters']['num_inference_steps'],
                "image_strength": 1 - prompt_data['parameters']['strength']  # Stability uses inverse
            }
            
            # Make request
            response = requests.post(url, headers=headers, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                
                # Save generated image
                output_path = self._save_generated_image(result['artifacts'][0]['base64'])
                
                return {
                    'success': True,
                    'generated_image_path': output_path,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'error': f'Stability API error: {response.text}',
                    'generated_image_path': None
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Image generation failed: {str(e)}',
                'generated_image_path': None
            }
    
    def _generate_replicate(self, image_path, prompt_data):
        """Generate using Replicate API"""
        if not self.replicate_token:
            return {
                'success': False,
                'error': 'Replicate API token not configured',
                'generated_image_path': None
            }
        
        try:
            import replicate
            
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            # Run model
            output = replicate.run(
                "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                input={
                    "image": f"data:image/jpeg;base64,{image_data}",
                    "prompt": prompt_data['positive_prompt'],
                    "negative_prompt": prompt_data['negative_prompt'],
                    "prompt_strength": prompt_data['parameters']['strength'],
                    "num_inference_steps": prompt_data['parameters']['num_inference_steps']
                }
            )
            
            # Download and save result
            if output:
                output_path = self._download_and_save(output[0])
                return {
                    'success': True,
                    'generated_image_path': output_path,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'error': 'No output from Replicate',
                    'generated_image_path': None
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Replicate generation failed: {str(e)}',
                'generated_image_path': None
            }
    
    def _generate_mock(self, image_path, prompt_data):
        """
        Mock generation for testing (returns slightly modified original)
        This is used when no API key is configured
        """
        try:
            # Load original image
            from PIL import Image
            img = Image.open(image_path)
            
            # Apply simple filter to simulate "renovation"
            from PIL import ImageEnhance
            
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.1)
            
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.1)
            
            # Save mock result
            output_path = os.path.join(
                Config.UPLOAD_FOLDER,
                f"generated_{os.path.basename(image_path)}"
            )
            img.save(output_path)
            
            return {
                'success': True,
                'generated_image_path': output_path,
                'error': None,
                'is_mock': True,
                'message': 'Mock generation (no API key configured). Configure Stability AI or Replicate API for real generation.'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Mock generation failed: {str(e)}',
                'generated_image_path': None
            }
    
    def _save_generated_image(self, base64_data):
        """Save base64 image data to file"""
        from PIL import Image
        image_data = base64.b64decode(base64_data)
        img = Image.open(io.BytesIO(image_data))
        
        output_path = os.path.join(
            Config.UPLOAD_FOLDER,
            f"generated_{os.urandom(8).hex()}.png"
        )
        img.save(output_path)
        
        return output_path
    
    def _download_and_save(self, url):
        """Download image from URL and save"""
        from PIL import Image
        response = requests.get(url)
        img = Image.open(io.BytesIO(response.content))
        
        output_path = os.path.join(
            Config.UPLOAD_FOLDER,
            f"generated_{os.urandom(8).hex()}.png"
        )
        img.save(output_path)
        
        return output_path
    
    def validate_output(self, image_path):
        """Validate generated image"""
        try:
            from PIL import Image
            img = Image.open(image_path)
            
            # Check resolution
            if img.size[0] < 256 or img.size[1] < 256:
                return False, "Generated image resolution too low"
            
            # Check if image is valid
            img.verify()
            
            return True, "Valid"
            
        except Exception as e:
            return False, f"Invalid image: {str(e)}"
