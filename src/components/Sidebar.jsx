import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, Bot, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Sidebar({ temaOscuro, toggleTema }) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();

    const handleCerrarSesion = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Cierra el menú en móviles después de hacer clic en un enlace
    const cerrarMenu = () => setMenuAbierto(false);

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
            ? 'bg-blue-600 text-white font-medium'
            : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
        }`;

    return (
        <>
            {/* 📱 HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-40 flex items-center justify-between px-6 shadow-md">
                <span className="font-bold text-xl">Finance BC</span>
                <button
                    onClick={() => setMenuAbierto(true)}
                    className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* 🌑 FONDO OSCURO PARA MÓVIL (Overlay) */}
            {menuAbierto && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
                    onClick={cerrarMenu}
                />
            )}

            {/* 🖥️ SIDEBAR PRINCIPAL */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transition-transform duration-300 ease-in-out ${menuAbierto ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 shadow-2xl md:shadow-none`}>

                <div className="p-6 flex items-center justify-between md:justify-start">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Finance BC</h2>

                    {/* Botón de cerrar (X) solo visible en móvil */}
                    <button onClick={cerrarMenu} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    <NavLink to="/" onClick={cerrarMenu} className={navLinkClass}>
                        <LayoutDashboard size={20} />
                        Resumen
                    </NavLink>
                    <NavLink to="/agregar" onClick={cerrarMenu} className={navLinkClass}>
                        <PlusCircle size={20} />
                        Agregar Gasto
                    </NavLink>
                    <NavLink to="/configuracion" onClick={cerrarMenu} className={navLinkClass}>
                        <Settings size={20} />
                        Configuración
                    </NavLink>
                    <NavLink to="/asistente" onClick={cerrarMenu} className={navLinkClass}>
                        <Bot size={20} />
                        Asistente IA
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <button
                        onClick={toggleTema}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
                    >
                        {temaOscuro ? <Sun size={20} /> : <Moon size={20} />}
                        {temaOscuro ? 'Modo Claro' : 'Modo Oscuro'}
                    </button>

                    <button
                        onClick={handleCerrarSesion}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
}