import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // <-- IMPORTAMOS useTheme
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Resumen from './pages/Resumen';
import AgregarGasto from './pages/AgregarGasto';
import AsistenteIA from './pages/AsistenteIA';
import Configuracion from './pages/Configuracion';

// Layout que incluye la barra lateral para las páginas del Dashboard
function DashboardLayout() {
  // 👇 2. Extraemos las variables del contexto
  const { temaOscuro, toggleTema } = useTheme(); 

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 w-full overflow-x-hidden">
      
      {/* 👇 3. Se las inyectamos al Sidebar */}
      <Sidebar temaOscuro={temaOscuro} toggleTema={toggleTema} />
      
      <main className="flex-1 min-w-0 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        <Outlet />
      </main>
      
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta Pública (Sin Sidebar) */}
            <Route path="/login" element={<Login />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Resumen />} />
                {/* CORRECCIÓN: Cambiamos de /agregar-gasto a /agregar para que coincida con el menú */}
                <Route path="/agregar" element={<AgregarGasto />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/asistente" element={<AsistenteIA />} />
              </Route>
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}