import { ADMIN_API } from '../config/api';
import tokenService from './tokenService';

/**
 * Admin API client with JWT authentication and auto-refresh.
 */
class AdminApiClient {
    private async request(url: string, options: RequestInit = {}): Promise<any> {
        const token = tokenService.getAccessToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });

            // Handle 401 — try token refresh
            if (response.status === 401 && token) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${tokenService.getAccessToken()}`;
                    const retryResponse = await fetch(url, { ...options, headers });
                    return this.handleResponse(retryResponse);
                } else {
                    tokenService.clearTokens();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
            }

            return this.handleResponse(response);
        } catch (error: any) {
            if (error.validationErrors || error.status) throw error;
            const networkError: any = new Error('Unable to connect to the server.');
            networkError.isNetworkError = true;
            throw networkError;
        }
    }

    private async handleResponse(response: Response): Promise<any> {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) {
                const error: any = new Error(data.detail || data.message || data.error || 'Request failed');
                error.validationErrors = data;
                error.status = response.status;
                throw error;
            }
            return data;
        }

        // For non-JSON responses (like CSV export)
        if (!response.ok) {
            const error: any = new Error(`Request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }

        return response;
    }

    private async refreshToken(): Promise<boolean> {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const response = await fetch(ADMIN_API.TOKEN_REFRESH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                tokenService.saveTokens(data.access, refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }

    async get(url: string): Promise<any> {
        return this.request(url, { method: 'GET' });
    }

    async post(url: string, data?: any): Promise<any> {
        return this.request(url, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put(url: string, data?: any): Promise<any> {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(url: string, data?: any): Promise<any> {
        return this.request(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(url: string): Promise<any> {
        return this.request(url, { method: 'DELETE' });
    }
}

export const adminApi = new AdminApiClient();
export default adminApi;
