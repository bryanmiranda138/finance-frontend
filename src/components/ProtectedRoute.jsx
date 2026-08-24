import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    // 1. Estado de carga mientras Supabase verifica el token en localStorage
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 2. Si no hay usuario autenticado, redirigir a Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si está autenticado, renderizar las rutas protegidas
    return <Outlet />;
}