import { ADMIN_API } from '../config/api';
import adminApi from './adminApiClient';

export interface PropertyFilters {
    search?: string;
    verified?: boolean;
    is_active?: boolean;
    is_featured?: boolean;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
    page?: number;
    ordering?: string;
}

function buildQueryString(filters: PropertyFilters): string {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.verified !== undefined) params.append('verified', String(filters.verified));
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
    if (filters.property_type) params.append('property_type', filters.property_type);
    if (filters.min_price) params.append('min_price', String(filters.min_price));
    if (filters.max_price) params.append('max_price', String(filters.max_price));
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.ordering) params.append('ordering', filters.ordering);
    return params.toString();
}

const propertyAdminService = {
    async getProperties(filters: PropertyFilters = {}) {
        const qs = buildQueryString(filters);
        const url = qs ? `${ADMIN_API.PROPERTIES}?${qs}` : ADMIN_API.PROPERTIES;
        return adminApi.get(url);
    },

    async getProperty(id: number) {
        return adminApi.get(ADMIN_API.PROPERTY_DETAIL(id));
    },

    async createProperty(data: any) {
        return adminApi.post(ADMIN_API.PROPERTIES, data);
    },

    async updateProperty(id: number, data: any) {
        return adminApi.patch(ADMIN_API.PROPERTY_DETAIL(id), data);
    },

    async deleteProperty(id: number) {
        return adminApi.delete(ADMIN_API.PROPERTY_DETAIL(id));
    },

    async verifyProperty(id: number) {
        return adminApi.post(ADMIN_API.PROPERTY_VERIFY(id));
    },

    async featureProperty(id: number) {
        return adminApi.post(ADMIN_API.PROPERTY_FEATURE(id));
    },

    async toggleActive(id: number) {
        return adminApi.post(ADMIN_API.PROPERTY_TOGGLE_ACTIVE(id));
    },

    async bulkAction(ids: number[], action: string) {
        return adminApi.post(ADMIN_API.PROPERTY_BULK, { ids, action });
    },

    async exportProperties() {
        const token = localStorage.getItem('admin_access_token');
        const response = await fetch(ADMIN_API.PROPERTY_EXPORT, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'properties_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    },
};

export default propertyAdminService;
