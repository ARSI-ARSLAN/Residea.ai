// API Configuration
// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Authentication
    REGISTER: `${API_BASE_URL}/api/auth/register/`,
    LOGIN: `${API_BASE_URL}/api/auth/login/`,
    TOKEN_REFRESH: `${API_BASE_URL}/api/auth/token/refresh/`,
    PROFILE: `${API_BASE_URL}/api/auth/profile/`,

    // Properties
    PROPERTIES: `${API_BASE_URL}/api/properties/`,
    PROPERTY_DETAIL: (id: number) => `${API_BASE_URL}/api/properties/${id}/`,
    PROPERTY_ROI: (id: number) => `${API_BASE_URL}/api/properties/${id}/roi_estimate/`,
    RECOMMENDATIONS: `${API_BASE_URL}/api/properties/recommendations/`,
    FEATURED_PROPERTIES: `${API_BASE_URL}/api/properties/featured/`,
    SIMILAR_PROPERTIES: (id: number) => `${API_BASE_URL}/api/properties/similar/?property_id=${id}`,
    LOCATIONS: `${API_BASE_URL}/api/properties/locations/`,
    MY_LISTINGS: `${API_BASE_URL}/api/properties/my_listings/`,
    UPLOAD_IMAGES: (id: number) => `${API_BASE_URL}/api/properties/${id}/upload_images/`,
    GALLERY: (id: number) => `${API_BASE_URL}/api/properties/${id}/gallery/`,

    // Preferences
    USER_PREFERENCES: `${API_BASE_URL}/api/preferences/`,

    // Saved Properties
    SAVED_PROPERTIES: `${API_BASE_URL}/api/auth/saved-properties/`,
    TOGGLE_SAVE: `${API_BASE_URL}/api/auth/saved-properties/toggle/`,

    // ML Services
    ML_HEALTH: `${API_BASE_URL}/api/ml/health/`,
};

export default API_BASE_URL;
