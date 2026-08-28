import React, { useState, useRef, useEffect } from 'react';
import { Calculator, X } from 'lucide-react';

export default function CalculadoraFlotante() {
    // 1. Estados base
    const [abierta, setAbierta] = useState(false);
    const [pantalla, setPantalla] = useState('');
    const [error, setError] = useState('');

    // 2. Estados de Posición y Arrastre
    // Inicializamos la burbuja en el centro-derecha de la pantalla
    const [pos, setPos] = useState({
        x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300,
        y: typeof window !== 'undefined' ? window.innerHeight / 2 - 28 : 300
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef(false);

    // 3. Inteligencia Espacial (Detectar cuadrantes de la pantalla)
    const isRight = pos.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const isBottom = pos.y > (typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

    // Determinar clases de Tailwind dinámicamente según el cuadrante
    const panelPositionClasses = `absolute ${isRight ? 'right-[70px]' : 'left-[70px]'} ${isBottom ? 'bottom-0' : 'top-0'}`;
    const originClass =
        isRight && isBottom ? 'origin-bottom-right' :
            isRight && !isBottom ? 'origin-top-right' :
                !isRight && isBottom ? 'origin-bottom-left' :
                    'origin-top-left';

    // 4. Motor de Arrastre (Drag & Drop)
    const iniciarArrastre = (e) => {
        dragRef.current = false;

        // Soportar tanto mouse como pantallas táctiles (celulares)
        const startX = e.clientX || (e.touches && e.touches[0].clientX);
        const startY = e.clientY || (e.touches && e.touches[0].clientY);
        const startPosX = pos.x;
        const startPosY = pos.y;

        const onMove = (moveEvent) => {
            const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
            const clientY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);

            const dx = clientX - startX;
            const dy = clientY - startY;

            // Si el usuario mueve el ratón más de 3 píxeles, cuenta como arrastre, no como clic
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                dragRef.current = true;
                setIsDragging(true);
            }

            let newX = startPosX + dx;
            let newY = startPosY + dy;

            // Límites de seguridad: Evitar que el botón se salga del monitor
            newX = Math.max(10, Math.min(newX, window.innerWidth - 66));
            newY = Math.max(10, Math.min(newY, window.innerHeight - 66));

            setPos({ x: newX, y: newY });
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
            setTimeout(() => setIsDragging(false), 0); // Pequeño retraso para evitar clic fantasma
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
    };

    const alternarCalculadora = () => {
        // Solo abrimos/cerramos si el usuario NO estaba arrastrando la burbuja
        if (!dragRef.current) {
            setAbierta(!abierta);
        }
    };

    // 5. Lógica Matemática de la Calculadora
    const manejarClick = (valor) => {
        setError('');
        if (pantalla === '0' && valor !== '.' && !['+', '-', '*', '/'].includes(valor)) {
            setPantalla(valor);
        } else {
            setPantalla((prev) => prev + valor);
        }
    };

    const limpiar = () => {
        setPantalla('');
        setError('');
    };

    const calcular = () => {
        try {
            setError('');
            if (!pantalla) return;

            if (!/^[0-9+\-*/().\s]*$/.test(pantalla)) {
                throw new Error('Sintaxis inválida');
            }

            const resultado = new Function('return ' + pantalla)();

            if (!isFinite(resultado) || isNaN(resultado)) {
                throw new Error('Error matemático');
            }

            setPantalla(parseFloat(resultado.toFixed(4)).toString());
        } catch (err) {
            setError('Error de sintaxis');
        }
    };

    // 6. Actualización de redimensionamiento (Por si el usuario gira el celular)
    useEffect(() => {
        const handleResize = () => {
            setPos(prev => ({
                x: Math.min(prev.x, window.innerWidth - 66),
                y: Math.min(prev.y, window.innerHeight - 66)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        // CONTENEDOR MAESTRO: Su posición es dictada por las coordenadas X e Y
        <div
            className="fixed z-50 w-14 h-14"
            style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        >

            {/* 🧮 PANEL DE LA CALCULADORA */}
            {/* Usa las variables dinámicas de posición (panelPositionClasses) y origen (originClass) */}
            <div
                className={`${panelPositionClasses} ${originClass} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden transition-all duration-300 ${abierta ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <Calculator size={16} /> Calculadora Rápida
                    </h3>
                    <button onClick={() => setAbierta(false)} className="hover:text-blue-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        value={pantalla}
                        placeholder="0"
                        readOnly
                        className="w-full bg-transparent text-right text-3xl font-mono text-gray-800 dark:text-gray-100 outline-none"
                    />
                    <div className="text-red-500 text-xs text-right h-4 mt-1 font-semibold tracking-wide">
                        {error}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 p-4">
                    <button onClick={() => manejarClick('(')} className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-3 rounded-xl font-bold shadow-sm">(</button>
                    <button onClick={() => manejarClick(')')} className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-3 rounded-xl font-bold shadow-sm">)</button>
                    <button onClick={limpiar} className="text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 p-3 rounded-xl font-bold shadow-sm">C</button>
                    <button onClick={() => manejarClick('/')} className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-3 rounded-xl font-bold shadow-sm">÷</button>

                    {[7, 8, 9].map((num) => (
                        <button key={num} onClick={() => manejarClick(num.toString())} className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-xl font-semibold shadow-sm">{num}</button>
                    ))}
                    <button onClick={() => manejarClick('*')} className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-3 rounded-xl font-bold shadow-sm">×</button>

                    {[4, 5, 6].map((num) => (
                        <button key={num} onClick={() => manejarClick(num.toString())} className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-xl font-semibold shadow-sm">{num}</button>
                    ))}
                    <button onClick={() => manejarClick('-')} className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-3 rounded-xl font-bold shadow-sm">-</button>

                    {[1, 2, 3].map((num) => (
                        <button key={num} onClick={() => manejarClick(num.toString())} className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-xl font-semibold shadow-sm">{num}</button>
                    ))}
                    <button onClick={() => manejarClick('+')} className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-3 rounded-xl font-bold shadow-sm">+</button>

                    <button onClick={() => manejarClick('0')} className="col-span-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-xl font-semibold shadow-sm">0</button>
                    <button onClick={() => manejarClick('.')} className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-xl font-semibold shadow-sm">.</button>
                    <button onClick={calcular} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 font-bold shadow-md shadow-blue-500/30">=</button>
                </div>
            </div>

            {/* 🔴 BOTÓN FLOTANTE (DRAGGABLE) */}
            <button
                onMouseDown={iniciarArrastre}
                onTouchStart={iniciarArrastre}
                onClick={alternarCalculadora}
                style={{ touchAction: 'none' }}
                className={`w-14 h-14 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center transition-transform duration-300 ${abierta ? 'rotate-12' : ''
                    } ${isDragging ? 'scale-95 cursor-grabbing' : 'hover:scale-110 cursor-grab active:scale-95'}`}
            >
                <Calculator size={24} />
            </button>

        </div>
    );
}