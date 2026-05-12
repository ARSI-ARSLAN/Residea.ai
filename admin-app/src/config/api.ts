// Admin Panel API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ADMIN_API = {
    // Authentication (shared with client)
    LOGIN: `${API_BASE_URL}/api/auth/login/`,
    TOKEN_REFRESH: `${API_BASE_URL}/api/auth/token/refresh/`,

    // Admin Dashboard
    DASHBOARD: `${API_BASE_URL}/api/admin/dashboard/`,

    // Admin Properties CRUD
    PROPERTIES: `${API_BASE_URL}/api/admin/properties/`,
    PROPERTY_DETAIL: (id: number) => `${API_BASE_URL}/api/admin/properties/${id}/`,
    PROPERTY_VERIFY: (id: number) => `${API_BASE_URL}/api/admin/properties/${id}/verify/`,
    PROPERTY_FEATURE: (id: number) => `${API_BASE_URL}/api/admin/properties/${id}/feature/`,
    PROPERTY_TOGGLE_ACTIVE: (id: number) => `${API_BASE_URL}/api/admin/properties/${id}/toggle_active/`,
    PROPERTY_EXPORT: `${API_BASE_URL}/api/admin/properties/export/`,
    PROPERTY_BULK: `${API_BASE_URL}/api/admin/properties/bulk_action/`,

    // Admin Users CRUD
    USERS: `${API_BASE_URL}/api/admin/users/`,
    USER_DETAIL: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/`,
    USER_TOGGLE_ACTIVE: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/toggle_active/`,
    USER_MAKE_STAFF: (id: number) => `${API_BASE_URL}/api/admin/users/${id}/make_staff/`,
};

export default API_BASE_URL;
