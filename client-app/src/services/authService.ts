import { API_ENDPOINTS } from '../config/api';
import apiClient from './apiClient';
import tokenService from './tokenService';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    user_type?: 'buyer' | 'seller' | 'investor' | 'agent';
}

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    user_type: string;
    has_completed_onboarding: boolean;
}

export const authService = {
    // Register new user
    async register(data: RegisterData): Promise<{ user: User; tokens: any }> {
        const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);

        // Save tokens and user data
        if (response.tokens) {
            tokenService.saveTokens(response.tokens.access, response.tokens.refresh);
            tokenService.saveUser(response.user);
        }

        return response;
    },

    // Login user
    async login(credentials: LoginCredentials): Promise<{ user: User; access: string; refresh: string }> {
        // Backend now accepts 'email' field directly
        const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);

        // Save tokens and user data
        tokenService.saveTokens(response.access, response.refresh);
        tokenService.saveUser(response.user);

        return response;
    },

    // Logout user
    logout(): void {
        tokenService.clearTokens();
    },

    // Get current user
    getCurrentUser(): User | null {
        return tokenService.getUser();
    },

    // Check if authenticated
    isAuthenticated(): boolean {
        return tokenService.isAuthenticated();
    },

    // Get user profile
    async getProfile(): Promise<User> {
        return apiClient.get(API_ENDPOINTS.PROFILE);
    },

    // Update user profile
    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await apiClient.put(API_ENDPOINTS.PROFILE, data);
        // Update cached user
        if (response) {
            const currentUser = tokenService.getUser();
            tokenService.saveUser({ ...currentUser, ...response });
        }
        return response;
    },

    // Patch user profile (partial update)
    async patchProfile(data: Partial<any>): Promise<any> {
        const response = await apiClient.patch(API_ENDPOINTS.PROFILE, data);
        if (response) {
            const currentUser = tokenService.getUser();
            tokenService.saveUser({ ...currentUser, ...response });
        }
        return response;
    },

    // Get saved/favorited properties
    async getSavedProperties(): Promise<any[]> {
        return apiClient.get(API_ENDPOINTS.SAVED_PROPERTIES);
    },

    // Toggle save/unsave a property
    async toggleSaveProperty(propertyId: number): Promise<{ saved: boolean; message: string }> {
        return apiClient.post(API_ENDPOINTS.TOGGLE_SAVE, { property_id: propertyId });
    },
};

export default authService;
