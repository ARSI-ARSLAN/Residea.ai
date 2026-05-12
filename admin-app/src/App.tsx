import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import tokenService from './services/tokenService';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './components/DashboardHome';
import PropertyManager from './components/PropertyManager';
import UserManager from './components/UserManager';

/**
 * Auth guard — redirects to login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!tokenService.isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

/**
 * Redirect authenticated users away from login page.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
    if (tokenService.isLoggedIn()) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public route */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <AdminLogin />
                        </PublicRoute>
                    }
                />

                {/* Protected admin routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardHome />} />
                    <Route path="/properties" element={<PropertyManager />} />
                    <Route path="/users" element={<UserManager />} />
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
