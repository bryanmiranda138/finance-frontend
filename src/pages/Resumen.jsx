import React, { useState, useEffect, useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { RefreshCw, PieChart as PieIcon, BarChart3, Calendar } from 'lucide-react';
import TablaGastos from '../components/TablaGastos';
import { supabase } from '../supabaseClient';

const CATEGORY_COLORS = {
    Alquiler: '#FF8042',
    Despensa: '#A28DFF',
    Electricidad: '#FF6680',
    Internet: '#00C49F',
    Otros: '#A0AEC0',
    Teléfono: '#FFBB28',
    Transporte: '#0088FE'
};

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

export default function Resumen() {
    const [gastos, setGastos] = useState([]);
    const [salariosMensuales, setSalariosMensuales] = useState({});
    const [tipoGrafico, setTipoGrafico] = useState('pie'); // 'pie' o 'bar'
    // 1. Inicializar el estado leyendo la memoria del navegador
    const [filtroAnio, setFiltroAnio] = useState(() => localStorage.getItem('finanzas_anio') || '');
    const [filtroMes, setFiltroMes] = useState(() => localStorage.getItem('finanzas_mes') || '');

    // 2. Guardar automáticamente en memoria cada vez que el usuario cambie el selector
    useEffect(() => {
        localStorage.setItem('finanzas_anio', filtroAnio);
    }, [filtroAnio]);

    useEffect(() => {
        localStorage.setItem('finanzas_mes', filtroMes);
    }, [filtroMes]);
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);

    const fetchDatos = async () => {
        try {
            setRefrescando(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) return;

            // 1. Cargar Perfil (Salarios Mensuales)
            const resPerfil = await fetch(`${import.meta.env.VITE_API_URL}/api/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resPerfil.ok) {
                const perfil = await resPerfil.json();
                if (perfil.salarios_mensuales) {
                    setSalariosMensuales(perfil.salarios_mensuales);
                } else if (perfil.salario_neto) {
                    const base = Number(perfil.salario_neto) || 0;
                    const inicial = {};
                    MESES.forEach(m => { inicial[m.valor] = base; });
                    setSalariosMensuales(inicial);
                }
            }

            // 2. Cargar Gastos
            const resGastos = await fetch(`${import.meta.env.VITE_API_URL}/api/gastos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resGastos.ok) throw new Error('Error al cargar gastos');
            const dataGastos = await resGastos.json();
            setGastos(dataGastos);

        } catch (error) {
            console.error("Error al cargar datos en Resumen:", error);
        } finally {
            setCargando(false);
            setRefrescando(false);
        }
    };

    useEffect(() => {
        fetchDatos();
    }, []);

    // Obtener lista dinámica de años registrados en los gastos
    const aniosDisponibles = useMemo(() => {
        const years = new Set(gastos.map(g => g.fecha?.split('-')[0]).filter(Boolean));
        return Array.from(years).sort((a, b) => b - a);
    }, [gastos]);

    // Filtrado de gastos por Año y Mes
    const gastosFiltrados = useMemo(() => {
        return gastos.filter(g => {
            if (!g.fecha) return false;
            const [year, month] = g.fecha.split('-');
            const coincideAnio = !filtroAnio || year === filtroAnio;
            const coincideMes = !filtroMes || month === filtroMes;
            return coincideAnio && coincideMes;
        });
    }, [gastos, filtroAnio, filtroMes]);

    // Cálculo de total de gastos
    const totalGastos = useMemo(() => {
        return gastosFiltrados.reduce((acc, g) => acc + Number(g.monto), 0);
    }, [gastosFiltrados]);

    // Cálculo de salario activo dinámico
    const salarioActivo = useMemo(() => {
        const cantidadAnios = aniosDisponibles.length || 1;

        if (filtroAnio && filtroMes) {
            return Number(salariosMensuales[filtroMes]) || 0;
        }
        if (filtroAnio && !filtroMes) {
            return Object.values(salariosMensuales).reduce((acc, val) => acc + Number(val), 0);
        }
        if (!filtroAnio && filtroMes) {
            return (Number(salariosMensuales[filtroMes]) || 0) * cantidadAnios;
        }
        const sumaAnual = Object.values(salariosMensuales).reduce((acc, val) => acc + Number(val), 0);
        return sumaAnual * cantidadAnios;
    }, [salariosMensuales, filtroAnio, filtroMes, aniosDisponibles]);

    // Saldo restante
    const saldoRestante = useMemo(() => salarioActivo - totalGastos, [salarioActivo, totalGastos]);

    // Datos para el gráfico de pastel (Distribución por Categoría)
    const datosPie = useMemo(() => {
        const agrupado = gastosFiltrados.reduce((acc, g) => {
            acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto);
            return acc;
        }, {});

        return Object.keys(agrupado).map(cat => ({
            name: cat,
            value: agrupado[cat]
        }));
    }, [gastosFiltrados]);

    // Datos para el gráfico de barras apiladas (Histórico por Mes y Año)
    const { datosBarras, categoriasEnBarras } = useMemo(() => {
        const agrupadoMensual = {};
        const categoriasDetectadas = new Set();

        gastosFiltrados.forEach((gasto) => {
            if (!gasto.fecha) return;
            const [year, month] = gasto.fecha.split('-');
            const claveCronologica = `${year}-${month}`; // Permite ordenar cronológicamente
            const mesNombre = MESES[parseInt(month, 10) - 1]?.nombre.slice(0, 3) || month;
            const etiquetaX = `${mesNombre} ${year}`; // Formato: "Ene 2026"
            const cat = gasto.categoria;

            categoriasDetectadas.add(cat);

            if (!agrupadoMensual[claveCronologica]) {
                agrupadoMensual[claveCronologica] = { mes: etiquetaX, clave: claveCronologica };
            }
            agrupadoMensual[claveCronologica][cat] = (agrupadoMensual[claveCronologica][cat] || 0) + Number(gasto.monto);
        });

        // Ordenar de más antiguo a más reciente
        const datosFormateados = Object.keys(agrupadoMensual)
            .sort()
            .map(key => agrupadoMensual[key]);

        return {
            datosBarras: datosFormateados,
            categoriasEnBarras: Array.from(categoriasDetectadas)
        };
    }, [gastosFiltrados]);

    // Texto del periodo activo para las etiquetas
    const textoPeriodo = useMemo(() => {
        const nombreMes = MESES.find(m => m.valor === filtroMes)?.nombre;
        if (filtroAnio && filtroMes) return `(${nombreMes} ${filtroAnio})`;
        if (filtroAnio) return `(${filtroAnio})`;
        if (filtroMes) return `(${nombreMes} - Todos los años)`;
        return '(Histórico)';
    }, [filtroAnio, filtroMes]);

    return (
        <div className="p-6 md:p-8 bg-transparent text-gray-900 dark:text-white min-h-full">

            {/* Encabezado con Filtros de Año y Mes */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold">Resumen Financiero</h1>

                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Calendar size={18} className="text-gray-500 ml-1" />

                    {/* Selector de Año */}
                    <select
                        value={filtroAnio}
                        onChange={(e) => setFiltroAnio(e.target.value)}
                        className="bg-transparent text-sm font-medium outline-none text-gray-800 dark:text-gray-200 cursor-pointer pr-1"
                    >
                        <option value="" className="dark:bg-gray-800">Todos los años</option>
                        {aniosDisponibles.map(a => (
                            <option key={a} value={a} className="dark:bg-gray-800">{a}</option>
                        ))}
                    </select>

                    <span className="text-gray-400">|</span>

                    {/* Selector de Mes */}
                    <select
                        value={filtroMes}
                        onChange={(e) => setFiltroMes(e.target.value)}
                        className="bg-transparent text-sm font-medium outline-none text-gray-800 dark:text-gray-200 cursor-pointer pr-2"
                    >
                        <option value="" className="dark:bg-gray-800">Todos los meses</option>
                        {MESES.map(m => (
                            <option key={m.valor} value={m.valor} className="dark:bg-gray-800">
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tarjetas de Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-green-700/90 text-white rounded-xl shadow-sm">
                    <h2 className="text-sm font-medium opacity-90 mb-1">
                        Salario Neto <span className="text-xs opacity-75">{textoPeriodo}</span>
                    </h2>
                    <p className="text-3xl font-bold">
                        ${cargando ? '...' : salarioActivo.toFixed(2)}
                    </p>
                </div>

                <div className="p-6 bg-red-700/90 text-white rounded-xl shadow-sm">
                    <h2 className="text-sm font-medium opacity-90 mb-1">
                        Total Gastos <span className="text-xs opacity-75">{textoPeriodo}</span>
                    </h2>
                    <p className="text-3xl font-bold">
                        ${cargando ? '...' : totalGastos.toFixed(2)}
                    </p>
                </div>

                <div className="p-6 bg-blue-700/90 text-white rounded-xl shadow-sm">
                    <h2 className="text-sm font-medium opacity-90 mb-1">
                        Saldo Restante <span className="text-xs opacity-75">{textoPeriodo}</span>
                    </h2>
                    <p className="text-3xl font-bold">
                        ${cargando ? '...' : saldoRestante.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Contenedor del Gráfico */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-lg font-semibold">
                        {tipoGrafico === 'pie' ? 'Distribución por Categoría' : 'Gastos Mensuales Apilados'}
                    </h2>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Botón Actualizar (Solo Icono) */}
                        <button
                            onClick={fetchDatos}
                            disabled={refrescando}
                            title="Actualizar datos"
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <RefreshCw size={18} className={refrescando ? 'animate-spin text-blue-500' : ''} />
                        </button>

                        {/* Alternador de Vista (Pastel / Barras) */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => setTipoGrafico('pie')}
                                title="Vista de Pastel"
                                className={`p-1.5 rounded-md transition-all ${tipoGrafico === 'pie'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <PieIcon size={18} />
                            </button>
                            <button
                                onClick={() => setTipoGrafico('bar')}
                                title="Vista de Barras Apiladas"
                                className={`p-1.5 rounded-md transition-all ${tipoGrafico === 'bar'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <BarChart3 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Renderizado de Gráficos */}
                {cargando ? (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                        Cargando visualización...
                    </div>
                ) : tipoGrafico === 'pie' ? (
                    datosPie.length > 0 ? (
                        <div className="w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={datosPie}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        innerRadius={60}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {datosPie.map((entry) => (
                                            <Cell
                                                key={`cell-${entry.name}`}
                                                fill={CATEGORY_COLORS[entry.name] || '#8884d8'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-500">
                            No hay gastos para este periodo.
                        </div>
                    )
                ) : (
                    datosBarras.length > 0 ? (
                        <div className="w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={datosBarras}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                    <XAxis dataKey="mes" stroke="#A0AEC0" />
                                    <YAxis stroke="#A0AEC0" tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }}
                                    />
                                    <Legend />
                                    {categoriasEnBarras.map((cat) => (
                                        <Bar
                                            key={cat}
                                            dataKey={cat}
                                            stackId="a"
                                            fill={CATEGORY_COLORS[cat] || '#8884d8'}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-500">
                            No hay suficientes datos para mostrar las barras apiladas.
                        </div>
                    )
                )}
            </div>

            {/* Tabla Inferior */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Detalle de Movimientos</h2>
                <TablaGastos />
            </div>
        </div>
    );
}