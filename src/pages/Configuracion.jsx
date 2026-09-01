import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Calendar } from 'lucide-react';

const MESES = [
    { valor: '01', nombre: 'Enero' },
    { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' },
    { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },
    { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' },
    { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' },
];

export default function Configuracion() {
    // 1. Leemos el caché primero. Si está vacío, usamos los ceros por defecto.
    const [salarios, setSalarios] = useState(() => {
        const salariosCacheados = localStorage.getItem('finanzas_salarios_cache');
        if (salariosCacheados) {
            return JSON.parse(salariosCacheados);
        }
        return {
            '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0,
            '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0
        };
    });
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarPerfil = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/perfil`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.salarios_mensuales) {
                        setSalarios(prev => ({ ...prev, ...data.salarios_mensuales }));
                        // 🔥 Guardamos los datos frescos de la base de datos en la memoria
                        localStorage.setItem('finanzas_salarios_cache', JSON.stringify(data.salarios_mensuales));
                    } else if (data.salario_neto) {
                        const base = Number(data.salario_neto) || 0;
                        const inicial = {};
                        MESES.forEach(m => { inicial[m.valor] = base; });
                        setSalarios(inicial);
                        // 🔥 Guardamos el salario base generado en la memoria
                        localStorage.setItem('finanzas_salarios_cache', JSON.stringify(inicial));
                    }
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        };
        cargarPerfil();
    }, []);

    const handleChange = (mesValor, valor) => {
        setSalarios(prev => ({
            ...prev,
            [mesValor]: valor
        }));
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const salariosNumericos = {};
            Object.keys(salarios).forEach(key => {
                salariosNumericos[key] = Number(salarios[key]) || 0;
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    salarios_mensuales: salariosNumericos,
                    salario_neto: salariosNumericos['01']
                })
            });

            if (!res.ok) throw new Error('Error al actualizar');

            // 🔥 Actualizamos la caché inmediatamente después de guardar exitosamente
            localStorage.setItem('finanzas_salarios_cache', JSON.stringify(salariosNumericos));

            setMensaje({ tipo: 'exito', texto: 'Salarios mensuales guardados correctamente.' });
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'No se pudo guardar la configuración.' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configuración de Cuenta
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Ingresa el Salario Neto asignado para cada mes del año.
            </p>

            {mensaje.texto && (
                <div className={`p-4 mb-6 rounded-lg ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleGuardar} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {MESES.map((mes) => (
                        <div key={mes.valor}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                <Calendar size={15} className="text-blue-500" />
                                {mes.nombre}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={salarios[mes.valor] ?? ''}
                                    onChange={(e) => handleChange(mes.valor, e.target.value)}
                                    className="w-full pl-8 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={cargando}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Save size={20} />
                    {cargando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
}