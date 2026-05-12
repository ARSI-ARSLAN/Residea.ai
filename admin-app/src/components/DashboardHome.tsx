import { useEffect, useState } from 'react';
import userAdminService from '../services/userAdminService';
import {
    Building2, Users, Eye,
    CheckCircle
} from 'lucide-react';

interface DashboardStats {
    total_properties: number;
    active_properties: number;
    verified_properties: number;
    featured_properties: number;
    total_users: number;
    active_users: number;
    staff_users: number;
    new_users_30d: number;
    total_property_views: number;
    total_saved_properties: number;
    properties_by_type: Record<string, number>;
    recent_users: any[];
    recent_properties: any[];
}

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await userAdminService.getDashboardStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <header className="admin-header">
                    <h1 className="admin-header-title">Dashboard</h1>
                </header>
                <div className="admin-content">
                    <div className="loading-page" style={{ minHeight: 400 }}>
                        <div className="spinner" />
                        <span>Loading dashboard...</span>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <header className="admin-header">
                    <h1 className="admin-header-title">Dashboard</h1>
                </header>
                <div className="admin-content">
                    <div className="panel">
                        <div className="panel-body">
                            <div className="empty-state">
                                <h3>Failed to Load</h3>
                                <p>{error}</p>
                                <button className="btn btn-outline" onClick={loadStats} style={{ marginTop: 16 }}>
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            label: 'Total Properties', value: stats.total_properties.toLocaleString(),
            icon: Building2, colorClass: 'primary',
            change: `${stats.active_properties} active`,
        },
        {
            label: 'Total Users', value: stats.total_users.toLocaleString(),
            icon: Users, colorClass: 'info',
            change: `+${stats.new_users_30d} this month`,
        },
        {
            label: 'Property Views', value: stats.total_property_views.toLocaleString(),
            icon: Eye, colorClass: 'success',
            change: `${stats.total_saved_properties} saved`,
        },
        {
            label: 'Verified Properties', value: stats.verified_properties.toLocaleString(),
            icon: CheckCircle, colorClass: 'warning',
            change: `${stats.featured_properties} featured`,
        },
    ];



    return (
        <>
            <header className="admin-header">
                <h1 className="admin-header-title">Dashboard</h1>
                <div className="admin-header-actions">
                    <span className="badge badge-success">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        System Online
                    </span>
                </div>
            </header>

            <div className="admin-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="stat-card">
                            <div className="stat-card-header">
                                <div>
                                    <div className="stat-card-label">{card.label}</div>
                                    <div className="stat-card-value">{card.value}</div>
                                    <div className="stat-card-change positive">{card.change}</div>
                                </div>
                                <div className={`stat-card-icon ${card.colorClass}`}>
                                    <card.icon size={22} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lower panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Recent Properties */}
                    <div className="panel">
                        <div className="panel-header">
                            <h3 className="panel-title">Recent Properties</h3>
                            <span className="badge badge-primary">{stats.recent_properties.length}</span>
                        </div>
                        <div className="panel-body" style={{ padding: '12px 22px' }}>
                            <div className="recent-list">
                                {stats.recent_properties.map((prop: any) => (
                                    <div key={prop.id} className="recent-item">
                                        <div className="recent-item-avatar"
                                            style={{ background: 'var(--gradient-primary)', borderRadius: 8, width: 38, height: 38 }}>
                                            <Building2 size={16} />
                                        </div>
                                        <div className="recent-item-info">
                                            <div className="name">{prop.title || `Property #${prop.id}`}</div>
                                            <div className="detail">{prop.location}</div>
                                        </div>
                                        <div className="recent-item-meta">
                                            {prop.verified
                                                ? <span className="badge badge-success">Verified</span>
                                                : <span className="badge badge-warning">Pending</span>
                                            }
                                        </div>
                                    </div>
                                ))}
                                {stats.recent_properties.length === 0 && (
                                    <div className="empty-state" style={{ padding: 30 }}>
                                        <p>No properties yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="panel">
                        <div className="panel-header">
                            <h3 className="panel-title">Recent Users</h3>
                            <span className="badge badge-info">{stats.recent_users.length}</span>
                        </div>
                        <div className="panel-body" style={{ padding: '12px 22px' }}>
                            <div className="recent-list">
                                {stats.recent_users.map((user: any) => (
                                    <div key={user.id} className="recent-item">
                                        <div className="recent-item-avatar"
                                            style={{ background: 'var(--gradient-info)' }}>
                                            {user.full_name?.[0] || user.email?.[0] || '?'}
                                        </div>
                                        <div className="recent-item-info">
                                            <div className="name">{user.full_name || user.email}</div>
                                            <div className="detail">{user.email}</div>
                                        </div>
                                        <div className="recent-item-meta">
                                            <span className={`badge badge-${user.is_active ? 'success' : 'danger'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {stats.recent_users.length === 0 && (
                                    <div className="empty-state" style={{ padding: 30 }}>
                                        <p>No users yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Properties by Type */}
                {Object.keys(stats.properties_by_type).length > 0 && (
                    <div className="panel" style={{ marginTop: 20 }}>
                        <div className="panel-header">
                            <h3 className="panel-title">Properties by Type</h3>
                        </div>
                        <div className="panel-body">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                {Object.entries(stats.properties_by_type).map(([type, count]) => (
                                    <div key={type} style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '12px 18px',
                                        minWidth: 140,
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                            {type || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
