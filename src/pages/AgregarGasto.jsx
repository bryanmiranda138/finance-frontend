import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
// Si usas react-icons o lucide-react puedes importar un icono de carga/guardado
// import { Save } from 'lucide-react'; 

export default function AgregarGasto() {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
        categoria: 'Alquiler',
        monto: '',
        descripcion: ''
    });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const categorias = [
        'Alquiler', 'Transporte', 'Internet', 'Teléfono',
        'Electricidad', 'Despensa', 'Otros'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            // 1. Obtener el token del usuario actual para enviarlo al backend
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("No hay sesión activa");

            // 2. Enviar la petición a tu backend en Render (Node.js)
            // Nota: Cambia localhost:3000 por la URL de Render cuando lo subas
            const response = await fetch('http://localhost:3000/api/gastos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Aquí protegemos la ruta
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al guardar en el servidor");
            }

            setMensaje({ tipo: 'exito', texto: 'Gasto registrado correctamente.' });

            // Limpiar el formulario (opcional)
            setFormData({ ...formData, monto: '', descripcion: '' });

        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Registrar Nuevo Gasto
            </h1>

            {mensaje.texto && (
                <div className={`p-4 mb-6 rounded-lg ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">

                {/* Fila 1: Fecha y Monto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha
                        </label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Monto ($)
                        </label>
                        <input
                            type="number"
                            name="monto"
                            step="0.01"
                            min="0"
                            value={formData.monto}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Fila 2: Categoría */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoría
                    </label>
                    <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Fila 3: Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción (Opcional)
                    </label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Ej: Pago mensual, supermercado, etc."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                    {loading ? 'Guardando...' : 'Guardar Gasto'}
                </button>
            </form>
        </div>
    );
}