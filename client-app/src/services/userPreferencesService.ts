import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

// Interfaces matching backend (UserPreference model)
export interface UserPreferences {
    user_id?: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    min_budget: number;
    max_budget: number;
    property_types: string[]; // JSON array in backend
    profession?: string;
    timeline?: string;
    preferred_locations?: string[]; // JSON array in backend

    // Legacy fields (optional)
    min_bedrooms?: number;
    max_bedrooms?: number;
    min_bathrooms?: number;
    min_area_sqft?: number;
}

// Function to save user preferences
export const saveUserPreferences = async (preferences: UserPreferences): Promise<any> => {
    try {
        // Using PUT to update or create (idempotent)
        // The endpoint /api/preferences/ expects the preference object
        const response = await apiClient.put(API_ENDPOINTS.USER_PREFERENCES, preferences);
        return response;
    } catch (error: any) {
        console.error('Error saving user preferences:', error);
        // Re-throw with better error message
        const errorMessage = error.validationErrors?.detail || error.message || 'Failed to save preferences';
        throw new Error(errorMessage);
    }
};

// Function to get user preferences
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USER_PREFERENCES);
        return response;
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return null;
    }
};
