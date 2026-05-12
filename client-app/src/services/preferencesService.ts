import { API_ENDPOINTS } from '../config/api';
import apiClient from './apiClient';

export interface UserPreferences {
    min_budget: number;
    max_budget: number;
    min_bedrooms: number;
    max_bedrooms: number;
    min_bathrooms: number;
    min_area_sqft: number;
    property_types: string[];
    purpose: 'living' | 'investment' | 'rental';
    hospital_importance: number;
    school_importance: number;
    restaurant_importance: number;
    shopping_importance: number;
    park_importance: number;
    metro_importance: number;
    security_importance: number;
    parking_importance: number;
    preferred_locations: string[];
}

export const preferencesService = {
    // Get user preferences
    async getPreferences(): Promise<UserPreferences> {
        return apiClient.get(API_ENDPOINTS.USER_PREFERENCES);
    },

    // Update user preferences
    async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
        return apiClient.put(API_ENDPOINTS.USER_PREFERENCES, data);
    },
};

export default preferencesService;
