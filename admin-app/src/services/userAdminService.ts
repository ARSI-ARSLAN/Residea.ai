import { ADMIN_API } from '../config/api';
import adminApi from './adminApiClient';

export interface UserFilters {
    search?: string;
    user_type?: string;
    is_active?: boolean;
    is_staff?: boolean;
    city?: string;
    page?: number;
    ordering?: string;
}

function buildQueryString(filters: UserFilters): string {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.user_type) params.append('user_type', filters.user_type);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.is_staff !== undefined) params.append('is_staff', String(filters.is_staff));
    if (filters.city) params.append('city', filters.city);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.ordering) params.append('ordering', filters.ordering);
    return params.toString();
}

const userAdminService = {
    async getUsers(filters: UserFilters = {}) {
        const qs = buildQueryString(filters);
        const url = qs ? `${ADMIN_API.USERS}?${qs}` : ADMIN_API.USERS;
        return adminApi.get(url);
    },

    async getUser(id: number) {
        return adminApi.get(ADMIN_API.USER_DETAIL(id));
    },

    async updateUser(id: number, data: any) {
        return adminApi.patch(ADMIN_API.USER_DETAIL(id), data);
    },

    async deleteUser(id: number) {
        return adminApi.delete(ADMIN_API.USER_DETAIL(id));
    },

    async toggleActive(id: number) {
        return adminApi.post(ADMIN_API.USER_TOGGLE_ACTIVE(id));
    },

    async makeStaff(id: number) {
        return adminApi.post(ADMIN_API.USER_MAKE_STAFF(id));
    },

    async getDashboardStats() {
        return adminApi.get(ADMIN_API.DASHBOARD);
    },
};

export default userAdminService;
