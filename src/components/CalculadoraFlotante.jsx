import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

export default function CalculadoraFlotante() {
    const [abierta, setAbierta] = useState(false);
    const [pantalla, setPantalla] = useState('');
    const [error, setError] = useState('');

    // 🧠 Función para manejar la escritura
    const manejarClick = (valor) => {
        setError('');
        // Evita empezar con múltiples ceros o con operadores (excepto menos y paréntesis)
        if (pantalla === '0' && valor !== '.' && !['+', '-', '*', '/'].includes(valor)) {
            setPantalla(valor);
        } else {
            setPantalla((prev) => prev + valor);
        }
    };

    // 🧹 Limpiar pantalla
    const limpiar = () => {
        setPantalla('');
        setError('');
    };

    // ⚖️ Evaluar matemáticamente respetando jerarquía y paréntesis
    const calcular = () => {
        try {
            setError('');
            if (!pantalla) return;

            // 🛡️ SEGURIDAD: Expresión regular que solo permite números, operadores y paréntesis.
            // Esto evita inyecciones de código antes de evaluar.
            if (!/^[0-9+\-*/().\s]*$/.test(pantalla)) {
                throw new Error('Sintaxis inválida');
            }

            // Usamos el motor nativo de JS que respeta automáticamente PEMDAS
            const resultado = new Function('return ' + pantalla)();

            // Validación contra divisiones entre cero u operaciones ilógicas
            if (!isFinite(resultado) || isNaN(resultado)) {
                throw new Error('Error matemático');
            }

            // Redondeamos a 4 decimales para evitar números infinitos (ej. 10/3)
            setPantalla(parseFloat(resultado.toFixed(4)).toString());
        } catch (err) {
            setError('Error de sintaxis');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* 🧮 Panel de la Calculadora */}
            <div
                className={`mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden transition-all duration-300 origin-bottom-right ${abierta ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
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

            {/* 🔴 Botón Flotante (Burbuja Roja) */}
            <button
                onClick={() => setAbierta(!abierta)}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_8px_16px_rgba(220,38,38,0.4)] flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95"
            >
                <Calculator size={24} className={abierta ? "rotate-12 transition-transform" : "transition-transform"} />
            </button>

        </div>
    );
}