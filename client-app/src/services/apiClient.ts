import { API_ENDPOINTS } from '../config/api';
import tokenService from './tokenService';

// API client with automatic token handling
class ApiClient {
    private async request(url: string, options: RequestInit = {}): Promise<any> {
        const token = tokenService.getAccessToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        // Add authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 - try to refresh token
            if (response.status === 401 && token) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry original request with new token
                    headers['Authorization'] = `Bearer ${tokenService.getAccessToken()}`;
                    const retryResponse = await fetch(url, { ...options, headers });
                    return this.handleResponse(retryResponse);
                } else {
                    // Refresh failed, logout user
                    tokenService.clearTokens();
                    window.location.href = '/login';
                    throw new Error('Session expired');
                }
            }

            return this.handleResponse(response);
        } catch (error: any) {
            // If error already has validationErrors (from handleResponse), re-throw it
            if (error.validationErrors) {
                throw error;
            }

            // This is a true network error (fetch failed before getting response)
            console.error('Network request failed:', error);
            const networkError: any = new Error('Unable to connect to the server. Please check your internet connection and try again.');
            networkError.isNetworkError = true;
            networkError.originalError = error;
            throw networkError;
        }
    }


    private async handleResponse(response: Response): Promise<any> {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                // Create error with message but also attach the full error data
                // This preserves field-specific validation errors from Django
                const errorMessage = data.detail || data.message || 'Request failed';
                const error: any = new Error(errorMessage);

                // Always attach validation errors for proper error handling
                error.validationErrors = data;
                error.status = response.status;

                // Log for debugging
                console.error('API Error Response:', {
                    status: response.status,
                    url: response.url,
                    data: data
                });

                throw error;
            }

            return data;
        }

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
            const response = await fetch(API_ENDPOINTS.TOKEN_REFRESH, {
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

    // HTTP methods
    async get(url: string, options?: RequestInit): Promise<any> {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url: string, data?: any, options?: RequestInit): Promise<any> {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(url: string, data?: any, options?: RequestInit): Promise<any> {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(url: string, data?: any, options?: RequestInit): Promise<any> {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(url: string, options?: RequestInit): Promise<any> {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
export default apiClient;
