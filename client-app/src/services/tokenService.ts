// Token management utilities

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const tokenService = {
    // Get access token
    getAccessToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Get refresh token
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    // Save tokens
    saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    // Remove tokens
    clearTokens(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Save user data
    saveUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    // Get user data
    getUser(): any | null {
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
};

export default tokenService;
