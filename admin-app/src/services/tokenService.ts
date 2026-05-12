// Token management for admin JWT authentication
const ACCESS_KEY = 'admin_access_token';
const REFRESH_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

const tokenService = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_KEY);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_KEY);
    },

    saveTokens(access: string, refresh: string): void {
        localStorage.setItem(ACCESS_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
    },

    saveUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    getUser(): any | null {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    clearTokens(): void {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    },

    isLoggedIn(): boolean {
        return !!this.getAccessToken();
    },

    isStaff(): boolean {
        const user = this.getUser();
        return user?.is_staff === true || user?.is_superuser === true;
    },
};

export default tokenService;
