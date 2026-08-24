import React, { useState, useEffect } from 'react';

export default function ModalEditarGasto({ isOpen, onClose, gasto, onSave }) {
    // Estado local para los datos del formulario
    const [formData, setFormData] = useState({
        id: '',
        fecha: '',
        categoria: '',
        monto: '',
        descripcion: ''
    });

    const categorias = [
        'Alquiler', 'Transporte', 'Internet', 'Teléfono',
        'Electricidad', 'Despensa', 'Otros'
    ];

    // Sincronizar el estado del formulario cuando se abre el modal con un gasto nuevo
    useEffect(() => {
        if (gasto) {
            setFormData(gasto);
        }
    }, [gasto]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.name === 'monto' ? parseFloat(e.target.value) || '' : e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí, en el futuro, harás el fetch PUT a tu backend.
        // Por ahora, solo pasamos los datos actualizados a la tabla.
        onSave(formData);
    };

    // Si el modal no está abierto, no renderizamos nada
    if (!isOpen) return null;

    return (
        // Fondo oscuro semitransparente (Backdrop)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

            {/* Contenedor del Modal */}
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Cabecera del Modal */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Editar Gasto
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-2xl"
                    >
                        &times;
                    </button>
                </div>

                {/* Cuerpo del Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto ($)</label>
                            <input
                                type="number"
                                name="monto"
                                step="0.01"
                                min="0"
                                value={formData.monto}
                                onChange={handleChange}
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="2"
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    {/* Botones de Acción */}
                    <div className="pt-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                        >
                            Guardar Cambios
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}