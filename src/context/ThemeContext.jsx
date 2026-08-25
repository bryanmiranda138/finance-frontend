import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [temaOscuro, setTemaOscuro] = useState(false);

    // Leer la memoria del navegador al cargar la página
    useEffect(() => {
        const temaGuardado = localStorage.getItem('finanzas_tema');
        const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (temaGuardado === 'dark' || (!temaGuardado && prefiereOscuro)) {
            setTemaOscuro(true);
            document.documentElement.classList.add('dark');
        } else {
            setTemaOscuro(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Función que se ejecuta al presionar el botón en tu Sidebar
    const toggleTema = () => {
        setTemaOscuro((prev) => {
            const nuevoTema = !prev;
            if (nuevoTema) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('finanzas_tema', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('finanzas_tema', 'light');
            }
            return nuevoTema;
        });
    };

    return (
        <ThemeContext.Provider value={{ temaOscuro, toggleTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);