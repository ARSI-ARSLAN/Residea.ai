import React, { useEffect, useState, useCallback } from 'react';
import propertyAdminService from '../services/propertyAdminService';
import type { PropertyFilters } from '../services/propertyAdminService';
import {
    Search, Plus, Edit, Trash2, CheckCircle, XCircle,
    Star, Download,
    Building2, ChevronLeft, ChevronRight, X, AlertTriangle,
    Power
} from 'lucide-react';

interface Property {
    id: number;
    title: string;
    location: string;
    price: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    verified: boolean;
    is_active: boolean;
    is_featured: boolean;
    views_count: number;
    main_image: string;
    owner_email: string | null;
    created_at: string;
}

export default function PropertyManager() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editProperty, setEditProperty] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        title: '', location: '', price: '', bedrooms: '3', bathrooms: '2',
        area_sqft: '', property_type: '', description: '',
    });

    const loadProperties = useCallback(async () => {
        setLoading(true);
        try {
            const data = await propertyAdminService.getProperties({
                ...filters, search, page,
            });
            setProperties(data.results || []);
            setTotalCount(data.count || 0);
        } catch (err) {
            console.error('Failed to load properties:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, search, page]);

    useEffect(() => { loadProperties(); }, [loadProperties]);

    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadProperties();
    };

    const resetForm = () => {
        setFormData({
            title: '', location: '', price: '', bedrooms: '3', bathrooms: '2',
            area_sqft: '', property_type: '', description: '',
        });
    };

    const handleCreate = async () => {
        try {
            setActionLoading(-1);
            await propertyAdminService.createProperty({
                ...formData,
                price: parseFloat(formData.price) || 0,
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                area_sqft: parseInt(formData.area_sqft) || 0,
            });
            setShowCreateModal(false);
            resetForm();
            setSuccessMsg('Property created successfully');
            loadProperties();
        } catch (err: any) {
            alert(err.message || 'Failed to create property');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdate = async () => {
        if (!editProperty) return;
        try {
            setActionLoading(editProperty.id);
            await propertyAdminService.updateProperty(editProperty.id, {
                ...formData,
                price: parseFloat(formData.price) || 0,
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                area_sqft: parseInt(formData.area_sqft) || 0,
            });
            setEditProperty(null);
            resetForm();
            setSuccessMsg('Property updated successfully');
            loadProperties();
        } catch (err: any) {
            alert(err.message || 'Failed to update property');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setActionLoading(deleteTarget.id);
            await propertyAdminService.deleteProperty(deleteTarget.id);
            setDeleteTarget(null);
            setSuccessMsg('Property deleted successfully');
            loadProperties();
        } catch (err: any) {
            alert(err.message || 'Failed to delete property');
        } finally {
            setActionLoading(null);
        }
    };

    const handleVerify = async (id: number) => {
        try {
            setActionLoading(id);
            await propertyAdminService.verifyProperty(id);
            loadProperties();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleFeature = async (id: number) => {
        try {
            setActionLoading(id);
            await propertyAdminService.featureProperty(id);
            loadProperties();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            setActionLoading(id);
            await propertyAdminService.toggleActive(id);
            loadProperties();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const openEdit = (prop: Property) => {
        setFormData({
            title: prop.title || '',
            location: prop.location || '',
            price: String(prop.price || ''),
            bedrooms: String(prop.bedrooms || ''),
            bathrooms: String(prop.bathrooms || ''),
            area_sqft: String(prop.area_sqft || ''),
            property_type: prop.property_type || '',
            description: '',
        });
        setEditProperty(prop);
    };

    const formatPrice = (price: string | number) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(num)) return 'N/A';
        if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `PKR ${(num / 100000).toFixed(1)} Lakh`;
        return `PKR ${num.toLocaleString()}`;
    };

    const totalPages = Math.ceil(totalCount / 20);

    return (
        <>
            <header className="admin-header">
                <h1 className="admin-header-title">Properties</h1>
                <div className="admin-header-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => propertyAdminService.exportProperties()}>
                        <Download size={15} /> Export CSV
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                        <Plus size={15} /> Add Property
                    </button>
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
                                <input
                                    className="form-input"
                                    placeholder="Search properties..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>
                            <select
                                className="form-input"
                                style={{ width: 140 }}
                                value={filters.verified === undefined ? '' : String(filters.verified)}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFilters(f => ({
                                        ...f,
                                        verified: v === '' ? undefined : v === 'true',
                                    }));
                                    setPage(1);
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                            </select>
                            <select
                                className="form-input"
                                style={{ width: 140 }}
                                value={filters.is_active === undefined ? '' : String(filters.is_active)}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFilters(f => ({
                                        ...f,
                                        is_active: v === '' ? undefined : v === 'true',
                                    }));
                                    setPage(1);
                                }}
                            >
                                <option value="">Active & Inactive</option>
                                <option value="true">Active Only</option>
                                <option value="false">Inactive Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Location</th>
                                    <th>Price</th>
                                    <th>Type</th>
                                    <th>Beds/Bath</th>
                                    <th>Status</th>
                                    <th>Verified</th>
                                    <th>Views</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9}>
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: 40, gap: 10, color: 'var(--text-muted)' }}>
                                                <div className="spinner" /> Loading...
                                            </div>
                                        </td>
                                    </tr>
                                ) : properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={9}>
                                            <div className="empty-state">
                                                <Building2 />
                                                <h3>No properties found</h3>
                                                <p>Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : properties.map((prop) => (
                                    <tr key={prop.id} style={{ opacity: prop.is_active ? 1 : 0.55 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: 8,
                                                    background: prop.main_image ? `url(${prop.main_image}) center/cover` : 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-color)', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {!prop.main_image && <Building2 size={14} color="var(--text-muted)" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {prop.title || `Property #${prop.id}`}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prop.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="wrap" style={{ maxWidth: 160 }}>{prop.location}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{formatPrice(prop.price)}</td>
                                        <td><span className="badge badge-muted">{prop.property_type || '—'}</span></td>
                                        <td>{prop.bedrooms}bd / {prop.bathrooms}ba</td>
                                        <td>
                                            {prop.is_active
                                                ? <span className="badge badge-success">Active</span>
                                                : <span className="badge badge-danger">Inactive</span>
                                            }
                                            {prop.is_featured && <span className="badge badge-warning" style={{ marginLeft: 4 }}>★</span>}
                                        </td>
                                        <td>
                                            {prop.verified
                                                ? <CheckCircle size={16} color="var(--accent-success)" />
                                                : <XCircle size={16} color="var(--text-muted)" />
                                            }
                                        </td>
                                        <td>{prop.views_count}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 2 }}>
                                                <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => openEdit(prop)}
                                                    disabled={actionLoading === prop.id}>
                                                    <Edit size={15} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title={prop.verified ? 'Unverify' : 'Verify'}
                                                    onClick={() => handleVerify(prop.id)} disabled={actionLoading === prop.id}>
                                                    {prop.verified ? <CheckCircle size={15} color="var(--accent-success)" /> : <CheckCircle size={15} />}
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title={prop.is_featured ? 'Unfeature' : 'Feature'}
                                                    onClick={() => handleFeature(prop.id)} disabled={actionLoading === prop.id}>
                                                    {prop.is_featured ? <Star size={15} color="var(--accent-warning)" fill="var(--accent-warning)" /> : <Star size={15} />}
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title={prop.is_active ? 'Deactivate' : 'Activate'}
                                                    onClick={() => handleToggleActive(prop.id)} disabled={actionLoading === prop.id}>
                                                    <Power size={15} color={prop.is_active ? 'var(--accent-success)' : 'var(--text-muted)'} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" title="Delete"
                                                    onClick={() => setDeleteTarget(prop)} disabled={actionLoading === prop.id}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="panel-footer">
                            <div className="pagination-info">
                                Showing {properties.length} of {totalCount} properties
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

            {/* Create/Edit Modal */}
            {(showCreateModal || editProperty) && (
                <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setEditProperty(null); resetForm(); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editProperty ? 'Edit Property' : 'Add New Property'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => { setShowCreateModal(false); setEditProperty(null); resetForm(); }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input className="form-input" placeholder="Property title"
                                        value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input className="form-input" placeholder="e.g. F-7, Islamabad"
                                        value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (PKR)</label>
                                    <input className="form-input" type="number" placeholder="e.g. 50000000"
                                        value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Property Type</label>
                                    <select className="form-input" value={formData.property_type}
                                        onChange={e => setFormData(f => ({ ...f, property_type: e.target.value }))}>
                                        <option value="">Select type</option>
                                        <option value="House">House</option>
                                        <option value="Flat">Flat</option>
                                        <option value="Plot">Plot</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Penthouse">Penthouse</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bedrooms</label>
                                    <input className="form-input" type="number" min="0"
                                        value={formData.bedrooms} onChange={e => setFormData(f => ({ ...f, bedrooms: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Bathrooms</label>
                                    <input className="form-input" type="number" min="0"
                                        value={formData.bathrooms} onChange={e => setFormData(f => ({ ...f, bathrooms: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Area (sq ft)</label>
                                <input className="form-input" type="number" placeholder="e.g. 2400"
                                    value={formData.area_sqft} onChange={e => setFormData(f => ({ ...f, area_sqft: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" rows={3} placeholder="Property description..."
                                    value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => { setShowCreateModal(false); setEditProperty(null); resetForm(); }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={editProperty ? handleUpdate : handleCreate}
                                disabled={actionLoading !== null}>
                                {actionLoading !== null && <span className="spinner" style={{ width: 16, height: 16 }} />}
                                {editProperty ? 'Save Changes' : 'Create Property'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-body">
                            <div className="confirm-icon danger">
                                <AlertTriangle size={28} />
                            </div>
                            <h3>Delete Property</h3>
                            <p>Are you sure you want to delete "<strong>{deleteTarget.title || `Property #${deleteTarget.id}`}</strong>"? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading !== null}>
                                {actionLoading !== null && <span className="spinner" style={{ width: 16, height: 16 }} />}
                                Delete Property
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
