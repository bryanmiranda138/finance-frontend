import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Creamos el contexto
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // 2. Inicializamos el estado verificando si el usuario ya tenía una preferencia guardada
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    // 3. Efecto para inyectar/quitar la clase 'dark' en el <html> (necesario para Tailwind)
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Guardamos la preferencia para futuras visitas
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook personalizado para usar el tema fácilmente
export const useTheme = () => useContext(ThemeContext);