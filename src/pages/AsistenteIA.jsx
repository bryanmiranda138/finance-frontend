import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AsistenteIA() {
    // 1. Iniciar leyendo el historial guardado en memoria
    const [mensajes, setMensajes] = useState(() => {
        const chatGuardado = localStorage.getItem('finanzas_chat_ia');
        return chatGuardado ? JSON.parse(chatGuardado) : [
            { rol: 'ia', texto: '¡Hola! Soy tu asistente financiero. Puedo ayudarte a analizar tus gastos, saber en qué categoría has gastado más o responder cualquier duda sobre tus finanzas. ¿Qué te gustaría consultar hoy?' }
        ];
    });

    const [input, setInput] = useState('');
    const [cargando, setCargando] = useState(false);
    const mensajesEndRef = useRef(null);

    // 2. Guardar en memoria automáticamente cada vez que la charla cambie
    useEffect(() => {
        localStorage.setItem('finanzas_chat_ia', JSON.stringify(mensajes));
    }, [mensajes]);

    const scrollToBottom = () => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    // 3. Función para resetear la conversación manual
    const limpiarChat = () => {
        const inicial = [{ rol: 'ia', texto: '¡Hola! Soy tu asistente financiero. Puedo ayudarte a analizar tus gastos. ¿Qué te gustaría consultar hoy?' }];
        setMensajes(inicial);
    };

    const handleEnviar = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const mensajeUsuario = { rol: 'usuario', texto: input };
        // Capturamos la conversación hasta este punto ANTES de agregar el mensaje nuevo
        const historialPrevio = [...mensajes];

        setMensajes((prev) => [...prev, mensajeUsuario]);
        setInput('');
        setCargando(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const filtroAnio = localStorage.getItem('finanzas_anio') || '';
            const filtroMes = localStorage.getItem('finanzas_mes') || '';

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pregunta: input,
                    filtroAnio,
                    filtroMes,
                    historial: historialPrevio // 🧠 ¡ENVIAMOS LA MEMORIA AL BACKEND!
                })
            });

            if (!res.ok) throw new Error('Error en la respuesta del servidor');
            const data = await res.json();

            setMensajes((prev) => [...prev, { rol: 'ia', texto: data.respuesta }]);
        } catch (error) {
            console.error(error);
            setMensajes((prev) => [...prev, { rol: 'ia', texto: 'Lo siento, ocurrió un error al procesar tu consulta. Revisa tu conexión o intenta de nuevo.' }]);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-transparent min-h-full flex flex-col h-[calc(100vh-80px)]">

            {/* Encabezado con Botón de Limpiar Chat */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asistente Financiero IA</h1>
                <button
                    onClick={limpiarChat}
                    title="Limpiar conversación"
                    className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline">Limpiar Chat</span>
                </button>
            </div>

            {/* Contenedor de Mensajes */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {mensajes.map((msg, index) => (
                        <div key={index} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 flex gap-3 ${msg.rol === 'usuario'
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                                }`}>
                                <div className="mt-1">
                                    {msg.rol === 'usuario' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.texto}</div>
                            </div>
                        </div>
                    ))}
                    {cargando && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                                <Bot size={20} className="text-gray-500" />
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={mensajesEndRef} />
                </div>

                {/* Formulario de Envío */}
                <form onSubmit={handleEnviar} className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ej: ¿Cuánto me queda de mi salario este mes?"
                            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={cargando}
                        />
                        <button
                            type="submit"
                            disabled={cargando || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}