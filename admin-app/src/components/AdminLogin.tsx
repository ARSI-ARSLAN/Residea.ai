import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API } from '../config/api';
import tokenService from '../services/tokenService';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(ADMIN_API.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || 'Invalid email or password.');
                setLoading(false);
                return;
            }

            // Check if user is staff/admin
            const user = data.user;
            if (!user) {
                setError('Invalid response from server.');
                setLoading(false);
                return;
            }

            // We need to check is_staff from the user data
            // The login response has user.id — we check via token claims or directly
            // For now, save tokens and try to access admin dashboard
            tokenService.saveTokens(data.access, data.refresh);
            tokenService.saveUser(user);

            // Verify admin access by hitting the dashboard endpoint
            const dashboardRes = await fetch(ADMIN_API.DASHBOARD, {
                headers: { 'Authorization': `Bearer ${data.access}` },
            });

            if (dashboardRes.status === 403) {
                tokenService.clearTokens();
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            if (!dashboardRes.ok) {
                tokenService.clearTokens();
                setError('Unable to verify admin access.');
                setLoading(false);
                return;
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError('Unable to connect to server. Is the Django backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)'
                    }}>
                        <Shield size={28} color="#fff" />
                    </div>
                    <h1>Residea.ai Admin</h1>
                    <p className="subtitle">Sign in to the admin panel</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="admin@residea.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: 42 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 10, top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)', padding: 4,
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                        style={{ marginTop: 8, padding: '12px 20px' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18 }} />
                                Signing In...
                            </>
                        ) : 'Sign In to Admin Panel'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center', marginTop: 20,
                    fontSize: '0.75rem', color: 'var(--text-muted)'
                }}>
                    Only staff accounts can access this panel.
                </p>
            </div>
        </div>
    );
}
