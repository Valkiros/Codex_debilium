import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface LoginProps {
    onClose?: () => void;
}

export default function Login({ onClose }: LoginProps) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            if (onClose) onClose();
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            setError("Inscription réussie ! Vérifiez vos emails (si activé) ou connectez-vous.")
        }
        setLoading(false)
    }

    return (
        <div className="w-full max-w-md bg-parchment p-8 rounded-lg shadow-2xl border-2 border-leather relative">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-leather hover:text-red-700 font-bold p-2"
                >
                    ✕
                </button>
            )}

            <h1 className="text-3xl font-bold mb-6 text-center text-leather">Connexion</h1>
            <p className="mb-6 text-center text-sm opacity-80 text-leather">Accédez à vos fiches en ligne</p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1 text-leather">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 rounded border border-leather/30 bg-input-bg text-ink focus:border-leather focus:outline-none"
                        placeholder="votre@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1 text-leather">Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded border border-leather/30 bg-input-bg text-ink focus:border-leather focus:outline-none"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="flex gap-4 mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 px-4 bg-leather text-parchment font-bold rounded hover:bg-leather/90 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {loading ? '...' : 'Connexion'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSignUp}
                        disabled={loading}
                        className="flex-1 py-2 px-4 bg-transparent border-2 border-leather text-leather font-bold rounded hover:bg-leather/10 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        Inscription
                    </button>
                </div>
            </form>
        </div>
    )
}
