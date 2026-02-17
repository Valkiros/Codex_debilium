import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface LoginProps {
    onClose?: () => void;
}

type ViewState = 'login' | 'register' | 'forgot-password';

export default function Login({ onClose }: LoginProps) {
    const [view, setView] = useState<ViewState>('login');
    const [loading, setLoading] = useState(false)

    // Form fields
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('') // New field

    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const resetForm = () => {
        setError(null);
        setSuccessMessage(null);
        // We might want to keep email when switching views for convenience
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error;
            if (onClose) onClose();
        } catch (err: any) {
            setError(err.message || "Erreur de connexion");
        } finally {
            setLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("L'email et le mot de passe sont obligatoires.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName, // Store in metadata
                    }
                }
            })

            if (error) throw error;
            setSuccessMessage("Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.");
        } catch (err: any) {
            setError(err.message || "Erreur d'inscription");
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Veuillez entrer votre email.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:3000/update-password', // Note: this URL might need adjustment for Tauri app
            });

            if (error) throw error;
            setSuccessMessage("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
        } catch (err: any) {
            setError(err.message || "Erreur d'envoi");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-parchment p-8 rounded-lg shadow-2xl border-2 border-leather relative animate-fade-in">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-leather hover:text-red-700 font-bold p-2"
                >
                    ✕
                </button>
            )}

            <h1 className="text-3xl font-bold mb-2 text-center text-leather">
                {view === 'login' && 'Connexion'}
                {view === 'register' && 'Créer un compte'}
                {view === 'forgot-password' && 'Mot de passe oublié'}
            </h1>

            <p className="mb-6 text-center text-sm opacity-80 text-leather">
                {view === 'login' && 'Accédez à vos fiches en ligne'}
                {view === 'register' && 'Rejoignez le Codex debilium'}
                {view === 'forgot-password' && 'Recevez un lien par email'}
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                    {successMessage}
                </div>
            )}

            {/* LOGIN FORM */}
            {view === 'login' && (
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
                        <div className="flex justify-between items-baseline mb-1">
                            <label className="block text-sm font-semibold text-leather">Mot de passe</label>
                            <button
                                type="button"
                                onClick={() => { setView('forgot-password'); resetForm(); }}
                                className="text-xs text-blue-800 hover:underline"
                            >
                                Oublié ?
                            </button>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded border border-leather/30 bg-input-bg text-ink focus:border-leather focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-leather text-parchment font-bold rounded hover:bg-leather/90 disabled:opacity-50 transition-colors cursor-pointer mt-2"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div className="text-center text-sm mt-2">
                        Pas encore de compte ?{' '}
                        <button
                            type="button"
                            onClick={() => { setView('register'); resetForm(); }}
                            className="font-bold text-blue-800 hover:underline"
                        >
                            S'inscrire
                        </button>
                    </div>
                </form>
            )}

            {/* REGISTER FORM */}
            {view === 'register' && (
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-leather">
                            Nom d'affichage <span className="font-normal opacity-70">(optionnel)</span>
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-2 rounded border border-leather/30 bg-input-bg text-ink focus:border-leather focus:outline-none"
                            placeholder="Pseudo"
                        />
                    </div>

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
                            placeholder="Minimum 6 caractères"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-leather">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 rounded border border-leather/30 bg-input-bg text-ink focus:border-leather focus:outline-none"
                            placeholder="Répétez le mot de passe"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-leather text-parchment font-bold rounded hover:bg-leather/90 disabled:opacity-50 transition-colors cursor-pointer mt-2"
                    >
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>

                    <div className="text-center text-sm mt-2">
                        Déjà un compte ?{' '}
                        <button
                            type="button"
                            onClick={() => { setView('login'); resetForm(); }}
                            className="font-bold text-blue-800 hover:underline"
                        >
                            Se connecter
                        </button>
                    </div>
                </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {view === 'forgot-password' && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-leather">Email du compte</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded border border-leather/30 bg-input-bg text-ink focus:border-leather focus:outline-none"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-leather text-parchment font-bold rounded hover:bg-leather/90 disabled:opacity-50 transition-colors cursor-pointer mt-2"
                    >
                        {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>

                    <div className="text-center text-sm mt-2">
                        <button
                            type="button"
                            onClick={() => { setView('login'); resetForm(); }}
                            className="font-bold text-blue-800 hover:underline"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
