import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import tokenService from '../services/tokenService';
import {
    LayoutDashboard, Building2, Users, LogOut, Shield
} from 'lucide-react';

export default function AdminLayout() {
    const navigate = useNavigate();
    const user = tokenService.getUser();

    const handleLogout = () => {
        tokenService.clearTokens();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/properties', icon: Building2, label: 'Properties' },
        { to: '/users', icon: Users, label: 'Users' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2>Residea.ai</h2>
                            <span>Admin Panel</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 12, padding: '0 2px'
                    }}>
                        <div className="admin-avatar">
                            {user?.first_name?.[0] || user?.email?.[0] || 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '0.8125rem', fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {user?.first_name || user?.email || 'Admin'}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                Staff Account
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-nav-item"
                        style={{ color: 'var(--accent-danger)' }}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
