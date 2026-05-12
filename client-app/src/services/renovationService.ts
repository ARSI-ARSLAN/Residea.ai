// Renovation Service — calls Phase 2 Flask backend at http://localhost:5000
// In dev, requests go through Vite proxy at /renovation-api

const RENOVATION_API_BASE = '/renovation-api';

export interface RenovationMetadata {
  room_type: string;
  room_size: string;
  property_age: string;
  condition: string;
  room_length: string;
  room_width: string;
  room_height: string;
}

export interface RenovationPreferences {
  goal: string;
  budget_tier: string;
  style: string;
  custom_preferences: string;
}

export interface RenovationSuggestion {
  action: string;
  description: string;
  priority_level: string;
  priority_score: number;
  impact: number;
  feasibility: number;
  budget_requirement: string;
}

export interface RenovationContextSummary {
  room: string;
  size: string;
  condition: string;
  style: string;
  budget: string;
  urgency: string;
}

export interface RenovationResult {
  success: boolean;
  context_summary: RenovationContextSummary;
  suggestions: RenovationSuggestion[];
  generated_image_url: string;
  original_image_url: string;
  prompt_used: string;
  metadata: {
    preprocessing: any;
    objects_detected: number;
    is_mock_generation: boolean;
  };
  warning?: string;
}

class RenovationService {
  async analyzeAndGenerate(
    imageFile: File,
    metadata: RenovationMetadata,
    preferences: RenovationPreferences
  ): Promise<RenovationResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('room_type', metadata.room_type);
    formData.append('room_size', metadata.room_size);
    formData.append('property_age', metadata.property_age);
    formData.append('condition', metadata.condition);
    formData.append('room_length', metadata.room_length);
    formData.append('room_width', metadata.room_width);
    formData.append('room_height', metadata.room_height);
    formData.append('goal', preferences.goal);
    formData.append('budget_tier', preferences.budget_tier);
    formData.append('style', preferences.style);
    formData.append('custom_preferences', preferences.custom_preferences);

    const response = await fetch(`${RENOVATION_API_BASE}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}`);
    }

    return response.json();
  }

  getImageUrl(relativeUrl: string): string {
    // Convert relative image paths from Phase 2 API to absolute URLs
    if (relativeUrl.startsWith('/api/image/')) {
      return `${RENOVATION_API_BASE}${relativeUrl}`;
    }
    return relativeUrl;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${RENOVATION_API_BASE}/api/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

const renovationService = new RenovationService();
export default renovationService;
