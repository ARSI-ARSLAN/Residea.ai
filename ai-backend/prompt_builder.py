class PromptBuilder:
    """Constructs high-quality prompts for image generation using professional templates"""
    
    def __init__(self):
        # ─── Premium Templates (Medium/High Budget) ───
        self.premium_templates = {
            'kitchen': {
                'positive': (
                    "Breathtaking, immaculate, hyper-realistic 8K commercial photography of a fully renovated "
                    "{style} {room_type} | Pristine quartz countertops and custom two-tone modern cabinetry "
                    "(light natural wood lowers, matte dark upper units) | Ultra-detailed kitchen island with "
                    "integrated flush-mount sink | Featuring specific upgrades: {upgraded_elements} replacing "
                    "damaged items | Retaining exact structural locations of {retained_elements} including "
                    "windows and plumbing points | Polished hardwood floors | Integrated, high-end seamless "
                    "appliances | Detailed tile backsplash | Minimalist pendant lighting and under-cabinet "
                    "warm LED strips | {custom_preferences} | {dimension_context} | Clean surfaces, open plan, "
                    "cinematic, volumetric lighting streaming through windows, depth of field (50mm, f/1.8), "
                    "Architectural Digest quality, ray tracing, flawless finishes"
                ),
                'negative': (
                    "(debris:1.4), (mess:1.3), peeling wallpaper, exposed wires, ruined cabinets, broken tiles, "
                    "warped floors, old appliances, fire damage, dirty, mold, distorted dimensions, blurry, "
                    "overexposed, (watermark:1.3)"
                )
            },
            'living_room': {
                'positive': (
                    "Hyper-realistic 8K commercial photography of an executive {style} {room_type} | "
                    "Modern mid-century design aesthetic | Featuring a large, polished wood rectangular table "
                    "with modular upholstered seating | Sleek integrated joinery and custom media walls | "
                    "Specific upgrades: {upgraded_elements} replacing damaged plaster and fixtures | "
                    "Retaining original {retained_elements} including pillars and window orientation | "
                    "Hardwood flooring and large textural area rug | Minimalist architectural lighting with "
                    "a single feature pendant | Seamless built-in entertainment area | {custom_preferences} | "
                    "{dimension_context} | Photographic perfection, soft volumetric lighting, cinematic "
                    "perspective (85mm, f/2.2), ultra-detailed finishes, sharp focus"
                ),
                'negative': (
                    "damaged walls, trash, exposed rebar, concrete floors, messy, broken furniture, cluttered, "
                    "cracked plaster, low resolution, warped dimensions, watermark, cartoon"
                )
            },
            'bedroom': {
                'positive': (
                    "Ultra-detailed, cinematic 8K commercial photography of a luxurious, serene {style} "
                    "{room_type} | Minimalist and cozy design | Low-profile bed with high-thread-count linens "
                    "and custom headboard | Built-in joinery desk and open shelving units | Specific upgrades: "
                    "{upgraded_elements} replacing debris and ruined floor and walls | Retaining "
                    "{retained_elements} window and structural layout | Soft neutral color palette with "
                    "polished concrete or hardwood flooring | Custom textural area rug | Integrated warm LED "
                    "strip lighting and bedside task lamps | {custom_preferences} | {dimension_context} | "
                    "Inviting, clean, architectural, soft-focus background, detailed textures (wool, wood, "
                    "glass), 105mm portrait lens perspective (f/2.8)"
                ),
                'negative': (
                    "rubble, broken glass, peeling paint, bare concrete walls, exposed pipes, abandoned, "
                    "messy bed, dark, gritty, distorted, cartoon"
                )
            }
        }
        
        # ─── Budget-Friendly Templates (Low Budget) ───
        self.budget_templates = {
            'kitchen': {
                'positive': (
                    "Hyper-realistic 8K commercial photography of a bright, cost-effective kitchen renovation | "
                    "Existing cabinetry refaced with clean, off-white shaker doors and simple matte black "
                    "hardware | Standard, durable butcher block countertops (replacing broken surfaces) | "
                    "Clean subway tile backsplash (classic 3x6 pattern) | Upgraded standard stainless steel "
                    "appliance suite | Repaired walls with fresh, neutral paint | Floating open wood shelving "
                    "units | Existing floor footprint covered with light oak Luxury Vinyl Plank (LVP) flooring | "
                    "Retaining {retained_elements} window orientation and plumbing locations | "
                    "{custom_preferences} | {dimension_context} | Bright, clean, volumetric daylight, soft "
                    "shadows, 50mm lens, f/4.0 focus (sharp throughout the room), ultra-detailed finishes, "
                    "inviting atmosphere"
                ),
                'negative': (
                    "debris, mess, broken cabinets, custom waterfall islands, marble countertops, integrated "
                    "high-end appliances, luxury lighting, structural changes, peeling paint, ruined walls, "
                    "blurry, water damage, low resolution"
                )
            },
            'living_room': {
                'positive': (
                    "Cinematic 8K commercial photography of a minimalist, cozy dining/hall area renovation on "
                    "a budget | Cleaned and repaired walls with fresh, light gray paint | Seamless installation "
                    "of durable wood-look Luxury Vinyl Plank (LVP) flooring covering original damage | Simple, "
                    "modern (IKEA-style) rectangular dining table with simple chairs | Standard, elegant "
                    "flush-mount ceiling lighting | Updated baseboards and window trim | Retaining original "
                    "{retained_elements} pillars and structural openings | {custom_preferences} | "
                    "{dimension_context} | Clean surfaces, open layout, cinematic daylight streaming in, soft "
                    "ambient light, 35mm wide lens perspective, f/5.6 focus, photorealistic textures, "
                    "uncluttered space"
                ),
                'negative': (
                    "damaged walls, trash, exposed rebar, bare concrete, peeling wallpaper, cracked plaster, "
                    "custom joinery, high-end design, expensive materials, distorted dimensions, blurry, "
                    "water damage"
                )
            },
            'bedroom': {
                'positive': (
                    "Hyper-realistic 8K commercial photography of a simple, fresh budget bedroom renovation | "
                    "Surface-repaired walls and ceiling with clean, warm white paint | Brand new standard "
                    "loop-pile carpet in neutral beige covering original floor damage | Simple, modern wooden "
                    "bed frame with clean bedding | Off-the-shelf modern wardrobe unit | Simple window "
                    "treatment | Retaining original {retained_elements} window and closet layout | "
                    "{custom_preferences} | {dimension_context} | Calm, clean atmosphere, cinematic soft "
                    "daylight, volumetric lighting, 50mm lens, f/2.2 depth of field (sharp bed, soft "
                    "background), ultra-detailed textiles"
                ),
                'negative': (
                    "debris, bare concrete, ruined walls, peeling wallpaper, exposed wiring, custom built-ins, "
                    "high-end materials, messy, cluttered, dark, distorted, low quality"
                )
            }
        }
    
    def build_prompt(self, context, suggestions):
        """
        Build structured prompt for image generation using professional templates
        
        Args:
            context: Unified context from multimodal fusion
            suggestions: List of renovation suggestions
            
        Returns:
            dict with positive_prompt, negative_prompt, and parameters
        """
        room_type = context['room_type']
        room_type_display = room_type.replace('_', ' ')
        style = context['style_preference']
        goal = context['renovation_goal']
        budget = context['budget_tier']
        
        # Select template based on budget tier
        if budget == 'low':
            templates = self.budget_templates
        else:
            templates = self.premium_templates
        
        template = templates.get(room_type, templates.get('living_room'))
        
        # Build dynamic placeholders
        upgraded_elements = self._get_upgraded_elements(suggestions, style)
        retained_elements = self._get_retained_elements(context)
        dimension_context = self._get_dimension_context(context)
        custom_preferences = self._get_custom_preferences(context)
        
        # Fill template
        positive_prompt = template['positive'].format(
            style=style,
            room_type=room_type_display,
            upgraded_elements=upgraded_elements,
            retained_elements=retained_elements,
            dimension_context=dimension_context,
            custom_preferences=custom_preferences
        )
        
        negative_prompt = template['negative']
        
        # Generation parameters
        parameters = {
            'strength': self._calculate_strength(context, goal),
            'guidance_scale': 7.5,
            'num_inference_steps': 30
        }
        
        return {
            'positive_prompt': positive_prompt,
            'negative_prompt': negative_prompt,
            'parameters': parameters
        }
    
    def _get_upgraded_elements(self, suggestions, style):
        """Extract upgraded elements from top suggestions for the prompt"""
        if not suggestions:
            return f"{style} modern finishes and updated fixtures"
        
        upgrades = []
        for s in suggestions[:4]:
            action = s.get('action', '')
            category = s.get('category', '')
            
            # Map suggestion categories to descriptive upgrade phrases
            category_upgrades = {
                'cabinets': f"new {style} cabinetry with modern hardware",
                'lighting': "LED under-cabinet lighting and modern pendant fixtures",
                'surfaces': "quartz countertops and designer backsplash",
                'appliances': "integrated stainless steel appliance suite",
                'paint': f"fresh {style} color palette throughout walls and ceiling",
                'flooring': "premium hardwood or polished LVP flooring",
                'storage': "built-in custom storage and organization systems",
                'walls': f"{style} accent feature wall with textural finish",
                'decor': f"{style} curated decor, textiles, and window treatments"
            }
            
            upgrade = category_upgrades.get(category, action)
            if upgrade and upgrade not in upgrades:
                upgrades.append(upgrade)
        
        return ", ".join(upgrades) if upgrades else f"{style} modern finishes and updated fixtures"
    
    def _get_retained_elements(self, context):
        """Determine structural elements to retain based on detected objects"""
        retained = []
        
        # Always retain structural elements
        retained.append("original window positions")
        retained.append("room structural layout")
        
        # Check detected objects for fixtures to retain
        objects = context.get('detected_objects', [])
        object_names = [obj.get('object', '').lower() for obj in objects]
        
        if 'sink' in object_names:
            retained.append("plumbing fixture locations")
        if any(x in object_names for x in ['door', 'window']):
            retained.append("door and window placements")
        
        return ", ".join(retained)
    
    def _get_dimension_context(self, context):
        """Build dimension description for the prompt"""
        dims = context.get('room_dimensions', {})
        parts = []
        
        if dims.get('length') and dims.get('width'):
            l, w = dims['length'], dims['width']
            area = l * w
            parts.append(f"{l}ft x {w}ft room ({area:.0f} sq ft)")
            
            if area > 300:
                parts.append("spacious open-plan proportions")
            elif area < 120:
                parts.append("compact space-efficient layout with smart storage")
            else:
                parts.append("well-proportioned room layout")
            
            if dims.get('height'):
                h = dims['height']
                parts.append(f"{h}ft ceiling height")
                if h >= 12:
                    parts.append("dramatic tall ceiling with statement lighting")
                elif h <= 8:
                    parts.append("cozy standard ceiling height")
        
        return ", ".join(parts) if parts else "standard room proportions"
    
    def _get_custom_preferences(self, context):
        """Sanitize and format user's custom preferences for the prompt"""
        custom = context.get('custom_preferences', '').strip()
        if custom:
            # Sanitize: limit length, remove newlines
            clean = custom[:300].replace('\n', ', ').replace('\r', '')
            return f"User specifically requests: {clean}"
        return "clean, modern aesthetic"
    
    def _calculate_strength(self, context, goal):
        """
        Calculate transformation strength
        Lower = preserve more of original
        Higher = more dramatic changes
        """
        goal_strength = {
            'refresh': 0.3,
            'budget_friendly': 0.35,
            'modernize': 0.5,
            'luxury_upgrade': 0.6
        }
        
        base_strength = goal_strength.get(goal, 0.4)
        
        # Adjust based on condition
        condition = context['current_condition']
        if condition < 3:
            base_strength += 0.1  # More changes for poor condition
        
        # Cap strength to preserve layout
        return min(base_strength, 0.65)
    
    def get_prompt_summary(self, prompt_data):
        """Generate human-readable prompt summary"""
        return {
            'description': prompt_data['positive_prompt'][:200] + '...',
            'strength': prompt_data['parameters']['strength'],
            'guidance': prompt_data['parameters']['guidance_scale']
        }
