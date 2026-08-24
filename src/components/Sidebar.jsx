import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Bot } from 'lucide-react'; // Asegúrate de tener lucide-react instalado para los íconos
// Opcional: Instala 'lucide-react' o 'react-icons' para los íconos
import { LayoutDashboard, PlusCircle, Settings, Moon, Sun, LogOut } from 'lucide-react';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();

    // Función auxiliar para aplicar estilos al enlace activo
    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
        }`;

    return (
        <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between fixed top-0 left-0">

            {/* Sección Superior: Logo y Navegación */}
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    FinanzasSPA
                </h2>

                <nav className="flex flex-col gap-2">
                    <NavLink to="/" className={getNavLinkClass}>
                        <LayoutDashboard size={20} />
                        <span>Resumen</span>
                    </NavLink>

                    <NavLink to="/agregar-gasto" className={getNavLinkClass}>
                        <PlusCircle size={20} />
                        <span>Agregar Gasto</span>
                    </NavLink>

                    <NavLink to="/configuracion" className={getNavLinkClass}>
                        <Settings size={20} />
                        <span>Configuración</span>
                    </NavLink>

                    <NavLink to="/asistente" className={getNavLinkClass}>
                        <Bot size={20} />
                        <span>Asistente IA</span>
                    </NavLink>
                </nav>
            </div>

            {/* Sección Inferior: Modo Oscuro y Logout */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors w-full text-left"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>Modo {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                </button>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}