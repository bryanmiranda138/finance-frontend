import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import ModalEditarGasto from './ModalEditarGasto';

export default function TablaGastos() {
    const [gastos, setGastos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados de filtros
    const [filtroMes, setFiltroMes] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gastoSeleccionado, setGastoSeleccionado] = useState(null);

    const categorias = ['Alquiler', 'Transporte', 'Internet', 'Teléfono', 'Electricidad', 'Despensa', 'Otros'];
    const meses = [
        { valor: '01', nombre: 'Enero' }, { valor: '02', nombre: 'Febrero' },
        { valor: '03', nombre: 'Marzo' }, { valor: '04', nombre: 'Abril' },
        { valor: '05', nombre: 'Mayo' }, { valor: '06', nombre: 'Junio' },
        { valor: '07', nombre: 'Julio' }, { valor: '08', nombre: 'Agosto' },
        { valor: '09', nombre: 'Septiembre' }, { valor: '10', nombre: 'Octubre' },
        { valor: '11', nombre: 'Noviembre' }, { valor: '12', nombre: 'Diciembre' },
    ];

    // Función auxiliar para obtener el token de Supabase
    const obtenerToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    };

    // 1. OBTENER GASTOS (GET)
    const cargarGastos = async () => {
        try {
            setCargando(true);
            const token = await obtenerToken();

            const res = await fetch('http://localhost:3000/api/gastos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al consultar los gastos');
            const data = await res.json();
            setGastos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarGastos();
    }, []);

    // 2. ELIMINAR GASTO (DELETE)
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;

        try {
            const token = await obtenerToken();
            const res = await fetch(`http://localhost:3000/api/gastos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('No se pudo eliminar el gasto');

            // Actualizar la interfaz removiendo el gasto eliminado
            setGastos(prev => prev.filter(g => g.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // 3. EDITAR GASTO (PUT)
    const handleSaveEdit = async (gastoActualizado) => {
        try {
            const token = await obtenerToken();
            const res = await fetch(`http://localhost:3000/api/gastos/${gastoActualizado.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(gastoActualizado)
            });

            if (!res.ok) throw new Error('No se pudo actualizar el gasto');
            const dataGuardada = await res.json();

            // Actualizar el estado local con los datos confirmados del servidor
            setGastos(prev => prev.map(g => g.id === dataGuardada.id ? dataGuardada : g));
            setIsModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (gasto) => {
        setGastoSeleccionado(gasto);
        setIsModalOpen(true);
    };

    const gastosFiltrados = useMemo(() => {
        return gastos.filter(gasto => {
            const mesGasto = gasto.fecha ? gasto.fecha.split('-')[1] : '';
            const coincideMes = filtroMes === '' || mesGasto === filtroMes;
            const coincideCategoria = filtroCategoria === '' || gasto.categoria === filtroCategoria;
            return coincideMes && coincideCategoria;
        });
    }, [gastos, filtroMes, filtroCategoria]);

    if (cargando) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando tus movimientos...</div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                {/* Barra de Filtros */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Filtros:</span>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <select
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
                        >
                            <option value="">Todos los meses</option>
                            {meses.map(m => (
                                <option key={m.valor} value={m.valor}>{m.nombre}</option>
                            ))}
                        </select>

                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 text-sm uppercase">
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Descripción</th>
                                <th className="p-4">Monto</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {gastosFiltrados.length > 0 ? (
                                gastosFiltrados.map((gasto) => (
                                    <tr key={gasto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200">
                                        <td className="p-4">{gasto.fecha}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {gasto.categoria}
                                            </span>
                                        </td>
                                        <td className="p-4">{gasto.descripcion}</td>
                                        <td className="p-4 font-semibold">${Number(gasto.monto).toFixed(2)}</td>
                                        <td className="p-4 flex justify-center gap-3">
                                            <button
                                                onClick={() => handleEditClick(gasto)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(gasto.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No se encontraron gastos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalEditarGasto
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gasto={gastoSeleccionado}
                onSave={handleSaveEdit}
            />
        </>
    );
}