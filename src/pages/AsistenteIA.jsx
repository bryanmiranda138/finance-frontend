import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bot, User, Send, Loader2 } from 'lucide-react';

export default function AsistenteIA() {
    const [mensajes, setMensajes] = useState([
        {
            remitente: 'bot',
            texto: '¡Hola! Soy tu asistente financiero. Puedo ayudarte a analizar tus gastos, saber en qué categoría has gastado más o responder cualquier duda sobre tus finanzas. ¿Qué te gustaría consultar hoy?'
        }
    ]);
    const [input, setInput] = useState('');
    const [cargando, setCargando] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll al final del chat cuando llega un mensaje nuevo
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || cargando) return;

        const preguntaUsuario = input.trim();
        setInput('');

        // 1. Agregar mensaje del usuario a la vista
        setMensajes((prev) => [...prev, { remitente: 'user', texto: preguntaUsuario }]);
        setCargando(true);

        try {
            // 2. Obtener Token JWT de Supabase
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // 3. Consultar a la API de Node.js
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pregunta: preguntaUsuario })
            });

            if (!res.ok) throw new Error('Error al conectar con el servidor');

            const data = await res.json();

            // 4. Agregar respuesta de Gemini a la vista
            setMensajes((prev) => [...prev, { remitente: 'bot', texto: data.respuesta }]);
        } catch (err) {
            setMensajes((prev) => [
                ...prev,
                { remitente: 'bot', texto: 'Lo siento, ocurrió un error al procesar tu consulta. Intenta nuevamente.' }
            ]);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Asistente Financiero IA
            </h1>

            {/* Ventana del Chat */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 overflow-y-auto space-y-4">
                {mensajes.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.remitente === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}
                    >
                        <div
                            className={`p-2 rounded-full ${msg.remitente === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-purple-600 text-white'
                                }`}
                        >
                            {msg.remitente === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>

                        <div
                            className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.remitente === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                                }`}
                        >
                            <p className="whitespace-pre-line">{msg.texto}</p>
                        </div>
                    </div>
                ))}

                {cargando && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm">Gemini está analizando tus finanzas...</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input de envío */}
            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ej: ¿Cuánto he gastado en Alquiler este mes?"
                    className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={cargando}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}