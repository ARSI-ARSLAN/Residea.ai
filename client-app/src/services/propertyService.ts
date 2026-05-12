import { API_ENDPOINTS } from '../config/api';
import apiClient from './apiClient';

export interface PropertyFeature {
    id: number;
    name: string;
}

export interface Property {
    id: number;
    title: string;
    location: string;
    price: string;
    price_per_sqft: number;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    property_type: string;
    verified: boolean;
    main_image: string;
    views_count: number;

    // Amenity Scores (0-1 normalized)
    hospital_score: number;
    school_score: number;
    restaurant_score: number;
    shopping_mall_score: number;
    park_score: number;
    metro_score: number;
    average_amenity_score: number;
    security_score: number;

    // Distances (in km)
    dist_to_hospital?: number;
    dist_to_school?: number;
    dist_to_restaurant?: number;
    dist_to_shopping_mall?: number;
    dist_to_park?: number;
    dist_to_metro?: number;

    // Features/Amenities
    features?: PropertyFeature[];

    // Metadata
    created_at: string;
    link?: string;
    description?: string;

    // ML (optional, from recommendations)
    ml_score?: number;
    match_percentage?: number;
    roi_1yr?: number;
    roi_5yr?: number;

    // Society Approvals (e.g. ["CDA", "RDA", "PHATA"])
    approval_status?: string[];
}

export interface PropertyDetail extends Property {
    images: Array<{ id: number; image_url: string; caption: string }>;
}

export interface PropertyFilters {
    min_price?: number;
    max_price?: number;
    min_bedrooms?: number;
    max_bedrooms?: number;
    min_bathrooms?: number;
    min_area?: number;
    max_area?: number;
    location?: string;
    property_type?: string;
    verified_only?: boolean;
    page?: number;
}

export interface ROIEstimate {
    roi_1yr: number;
    roi_3yr: number;
    roi_5yr: number;
    risk_adjusted_roi: number;
    base_score: number;
}

export interface PropertyRecommendation {
    property: Property;
    ml_score: number;
    match_percentage: number;
    roi_1yr: number;
    roi_5yr: number;
}

export const propertyService = {
    // Get all properties with filters
    async getProperties(filters?: PropertyFilters): Promise<{ count: number; results: Property[] }> {
        const params = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }

        const url = `${API_ENDPOINTS.PROPERTIES}?${params.toString()}`;
        return apiClient.get(url);
    },

    // Get single property details
    async getPropertyDetail(id: number): Promise<PropertyDetail> {
        return apiClient.get(API_ENDPOINTS.PROPERTY_DETAIL(id));
    },

    // Get ROI estimate for property
    async getROIEstimate(id: number): Promise<ROIEstimate> {
        return apiClient.get(API_ENDPOINTS.PROPERTY_ROI(id));
    },

    // Get personalized recommendations
    async getRecommendations(limit: number = 20): Promise<PropertyRecommendation[]> {
        try {
            const response: any = await apiClient.get(`${API_ENDPOINTS.RECOMMENDATIONS}?limit=${limit}`);

            console.log('Recommendations API response:', response);

            // The ML recommendations API returns: { count, properties: [{property, score, match_percentage, roi_1yr, roi_5yr}] }
            if (response && response.properties && Array.isArray(response.properties)) {
                return response.properties;
            }

            // Fallback to empty array if structure is unexpected
            console.warn('Unexpected recommendations response structure:', response);
            return [];
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return [];
        }
    },

    // Get featured properties
    async getFeaturedProperties(): Promise<Property[]> {
        return apiClient.get(API_ENDPOINTS.FEATURED_PROPERTIES);
    },

    // Get similar properties
    async getSimilarProperties(propertyId: number): Promise<Property[]> {
        return apiClient.get(API_ENDPOINTS.SIMILAR_PROPERTIES(propertyId));
    },

    // Save/unsave property
    async toggleSaveProperty(propertyId: number): Promise<{ saved: boolean; message: string }> {
        return apiClient.post(API_ENDPOINTS.TOGGLE_SAVE, { property_id: propertyId });
    },

    // Get saved properties
    async getSavedProperties(): Promise<any[]> {
        return apiClient.get(API_ENDPOINTS.SAVED_PROPERTIES);
    },

    // Get locations for autocomplete
    async getLocations(searchTerm?: string): Promise<{ locations: string[]; count: number }> {
        const url = searchTerm
            ? `${API_ENDPOINTS.LOCATIONS}?q=${encodeURIComponent(searchTerm)}`
            : API_ENDPOINTS.LOCATIONS;
        return apiClient.get(url);
    },

    // Create a new property listing (requires authenticated user)
    async createProperty(payload: Partial<Property>): Promise<PropertyDetail> {
        return apiClient.post(API_ENDPOINTS.PROPERTIES, payload);
    },

    // Get listings owned by the current user
    async getMyListings(): Promise<Property[]> {
        return apiClient.get(API_ENDPOINTS.MY_LISTINGS);
    },

    // Delete a property listing
    async deleteProperty(id: number): Promise<void> {
        return apiClient.delete(API_ENDPOINTS.PROPERTY_DETAIL(id));
    },

    // Upload images for a property (multipart/form-data)
    async uploadImages(propertyId: number, files: File[]): Promise<any> {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        // Use fetch directly for multipart (apiClient forces JSON content-type)
        const token = (await import('./tokenService')).default.getAccessToken();
        const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGES(propertyId), {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || data.detail || 'Upload failed');
        }

        return response.json();
    },

    // Get gallery images for a property
    async getGallery(propertyId: number): Promise<{ main_image: string; images: Array<{ id: number; image_url: string; caption: string }>; count: number }> {
        return apiClient.get(API_ENDPOINTS.GALLERY(propertyId));
    },
};

export default propertyService;
