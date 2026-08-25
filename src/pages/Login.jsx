import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoFinance from '../assets/finance.png';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const { error } = await login(email, password);
        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <a href="/" className="flex items-center justify-center mb-6">
                    {/* 2. Reemplaza el src con la variable importada */}
                    <img src={logoFinance} alt="Logo" className="h-12 w-auto" />
                </a>
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Iniciar Sesión</h2>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}