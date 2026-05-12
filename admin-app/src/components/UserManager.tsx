import React, { useEffect, useState, useCallback } from 'react';
import userAdminService from '../services/userAdminService';
import type { UserFilters } from '../services/userAdminService';
import {
    Search, Users, Edit, Shield, ShieldOff, Power,
    ChevronLeft, ChevronRight, X, Eye, Trash2
} from 'lucide-react';

interface User {
    id: number;
    email: string;
    username: string;
    full_name: string;
    first_name: string;
    last_name: string;
    user_type: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined: string;
    last_active: string;
    phone_number: string;
    city: string;
    country: string;
    has_completed_onboarding: boolean;
    properties_count: number;
    saved_count: number;
}

export default function UserManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<UserFilters>({});
    const [detailUser, setDetailUser] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [editFormData, setEditFormData] = useState({
        first_name: '', last_name: '', user_type: '', phone_number: '', city: '', country: '',
    });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userAdminService.getUsers({ ...filters, search, page });
            setUsers(data.results || []);
            setTotalCount(data.count || 0);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, search, page]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadUsers();
    };

    const handleToggleActive = async (id: number) => {
        try {
            setActionLoading(id);
            const result = await userAdminService.toggleActive(id);
            setSuccessMsg(result.message);
            loadUsers();
        } catch (err: any) {
            alert(err.message || 'Failed to toggle user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMakeStaff = async (id: number) => {
        try {
            setActionLoading(id);
            const result = await userAdminService.makeStaff(id);
            setSuccessMsg(result.message);
            loadUsers();
        } catch (err: any) {
            alert(err.message || 'Failed to change staff status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
        try {
            setActionLoading(id);
            const result = await userAdminService.deleteUser(id);
            setSuccessMsg(result.message);
            loadUsers();
        } catch (err: any) {
            alert(err.message || 'Failed to deactivate user');
        } finally {
            setActionLoading(null);
        }
    };

    const openDetail = async (id: number) => {
        setDetailLoading(true);
        try {
            const data = await userAdminService.getUser(id);
            setDetailUser(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    const openEdit = (user: User) => {
        setEditFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            user_type: user.user_type || 'buyer',
            phone_number: user.phone_number || '',
            city: user.city || '',
            country: user.country || '',
        });
        setEditUser(user);
    };

    const handleUpdate = async () => {
        if (!editUser) return;
        try {
            setActionLoading(editUser.id);
            await userAdminService.updateUser(editUser.id, editFormData);
            setEditUser(null);
            setSuccessMsg('User updated successfully');
            loadUsers();
        } catch (err: any) {
            alert(err.message || 'Failed to update user');
        } finally {
            setActionLoading(null);
        }
    };

    const getRoleBadge = (type: string, isStaff: boolean, isSuperuser: boolean) => {
        if (isSuperuser) return <span className="badge badge-danger">Superuser</span>;
        if (isStaff) return <span className="badge badge-warning">Staff</span>;
        const map: Record<string, string> = {
            buyer: 'badge-success', seller: 'badge-info',
            investor: 'badge-primary', agent: 'badge-warning',
        };
        return <span className={`badge ${map[type] || 'badge-muted'}`}>{type || 'unknown'}</span>;
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const totalPages = Math.ceil(totalCount / 20);

    return (
        <>
            <header className="admin-header">
                <h1 className="admin-header-title">Users</h1>
                <div className="admin-header-actions">
                    <span className="badge badge-info">{totalCount} total</span>
                </div>
            </header>

            <div className="admin-content">
                {successMsg && (
                    <div style={{
                        background: 'var(--accent-success-bg)', color: 'var(--accent-success)',
                        padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16,
                        fontSize: '0.875rem', border: '1px solid rgba(52,211,153,0.2)',
                    }}>
                        ✓ {successMsg}
                    </div>
                )}

                <div className="panel">
                    <div className="panel-header">
                        <div className="toolbar" style={{ width: '100%' }}>
                            <form onSubmit={handleSearch} className="search-input">
                                <Search />
                                <input className="form-input" placeholder="Search users..."
                                    value={search} onChange={(e) => setSearch(e.target.value)} />
                            </form>
                            <select className="form-input" style={{ width: 140 }}
                                value={filters.user_type || ''}
                                onChange={(e) => { setFilters(f => ({ ...f, user_type: e.target.value || undefined })); setPage(1); }}>
                                <option value="">All Roles</option>
                                <option value="buyer">Buyer</option>
                                <option value="seller">Seller</option>
                                <option value="investor">Investor</option>
                                <option value="agent">Agent</option>
                            </select>
                            <select className="form-input" style={{ width: 140 }}
                                value={filters.is_active === undefined ? '' : String(filters.is_active)}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFilters(f => ({ ...f, is_active: v === '' ? undefined : v === 'true' }));
                                    setPage(1);
                                }}>
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Last Active</th>
                                    <th>Properties</th>
                                    <th>Saved</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8}>
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: 40, gap: 10, color: 'var(--text-muted)' }}>
                                                <div className="spinner" /> Loading...
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={8}>
                                            <div className="empty-state">
                                                <Users />
                                                <h3>No users found</h3>
                                                <p>Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} style={{ opacity: user.is_active ? 1 : 0.55 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%',
                                                    background: user.is_staff ? 'var(--gradient-primary)' : 'var(--gradient-info)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                                                }}>
                                                    {(user.full_name || user.email)?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{user.full_name || user.username}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getRoleBadge(user.user_type, user.is_staff, user.is_superuser)}</td>
                                        <td>
                                            {user.is_active
                                                ? <span className="badge badge-success">Active</span>
                                                : <span className="badge badge-danger">Suspended</span>
                                            }
                                        </td>
                                        <td style={{ fontSize: '0.8125rem' }}>{formatDate(user.date_joined)}</td>
                                        <td style={{ fontSize: '0.8125rem' }}>{formatDate(user.last_active)}</td>
                                        <td>{user.properties_count}</td>
                                        <td>{user.saved_count}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 2 }}>
                                                <button className="btn btn-ghost btn-icon" title="View Details"
                                                    onClick={() => openDetail(user.id)}>
                                                    <Eye size={15} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title="Edit"
                                                    onClick={() => openEdit(user)} disabled={actionLoading === user.id}>
                                                    <Edit size={15} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon"
                                                    title={user.is_staff ? 'Remove Staff' : 'Make Staff'}
                                                    onClick={() => handleMakeStaff(user.id)} disabled={actionLoading === user.id}>
                                                    {user.is_staff
                                                        ? <Shield size={15} color="var(--accent-warning)" />
                                                        : <ShieldOff size={15} />
                                                    }
                                                </button>
                                                <button className="btn btn-ghost btn-icon"
                                                    title={user.is_active ? 'Suspend' : 'Activate'}
                                                    onClick={() => handleToggleActive(user.id)} disabled={actionLoading === user.id}>
                                                    <Power size={15} color={user.is_active ? 'var(--accent-success)' : 'var(--text-muted)'} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title="Deactivate"
                                                    onClick={() => handleDelete(user.id)} disabled={actionLoading === user.id}
                                                    style={{ color: 'var(--accent-danger)' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="panel-footer">
                            <div className="pagination-info">
                                Showing {users.length} of {totalCount} users
                            </div>
                            <div className="pagination">
                                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="pagination-info">Page {page} of {totalPages}</span>
                                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {(detailUser || detailLoading) && (
                <div className="modal-overlay" onClick={() => { setDetailUser(null); setDetailLoading(false); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
                        <div className="modal-header">
                            <h2>User Details</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => { setDetailUser(null); setDetailLoading(false); }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {detailLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 40, gap: 10, color: 'var(--text-muted)' }}>
                                    <div className="spinner" /> Loading...
                                </div>
                            ) : detailUser && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: '50%',
                                            background: 'var(--gradient-primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                                        }}>
                                            {(detailUser.full_name || detailUser.email)?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                                {detailUser.full_name || detailUser.username}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {detailUser.email}
                                            </div>
                                        </div>
                                    </div>
                                    {[
                                        ['Role', detailUser.user_type],
                                        ['Staff', detailUser.is_staff ? 'Yes' : 'No'],
                                        ['Active', detailUser.is_active ? 'Yes' : 'No'],
                                        ['Phone', detailUser.phone_number || '—'],
                                        ['City', detailUser.city || '—'],
                                        ['Country', detailUser.country || '—'],
                                        ['Joined', formatDate(detailUser.date_joined)],
                                        ['Onboarded', detailUser.has_completed_onboarding ? 'Yes' : 'No'],
                                        ['Properties', detailUser.properties_count],
                                        ['Saved', detailUser.saved_count],
                                    ].map(([label, val]) => (
                                        <div key={String(label)} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            padding: '8px 0', borderBottom: '1px solid var(--border-color)',
                                        }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
                                            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{String(val)}</span>
                                        </div>
                                    ))}
                                    {detailUser.preferences && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>Preferences</div>
                                            {[
                                                ['Budget', `PKR ${detailUser.preferences.min_budget} - ${detailUser.preferences.max_budget}`],
                                                ['Bedrooms', detailUser.preferences.bedrooms],
                                                ['Purpose', detailUser.preferences.purpose],
                                                ['City', detailUser.preferences.city],
                                            ].map(([label, val]) => (
                                                <div key={String(label)} style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    padding: '6px 0', fontSize: '0.8125rem',
                                                }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                                    <span>{String(val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditUser(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input className="form-input" value={editFormData.first_name}
                                        onChange={e => setEditFormData(f => ({ ...f, first_name: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input className="form-input" value={editFormData.last_name}
                                        onChange={e => setEditFormData(f => ({ ...f, last_name: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select className="form-input" value={editFormData.user_type}
                                    onChange={e => setEditFormData(f => ({ ...f, user_type: e.target.value }))}>
                                    <option value="buyer">Buyer</option>
                                    <option value="seller">Seller</option>
                                    <option value="investor">Investor</option>
                                    <option value="agent">Agent</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input className="form-input" value={editFormData.phone_number}
                                        onChange={e => setEditFormData(f => ({ ...f, phone_number: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input className="form-input" value={editFormData.city}
                                        onChange={e => setEditFormData(f => ({ ...f, city: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setEditUser(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleUpdate} disabled={actionLoading !== null}>
                                {actionLoading !== null && <span className="spinner" style={{ width: 16, height: 16 }} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
