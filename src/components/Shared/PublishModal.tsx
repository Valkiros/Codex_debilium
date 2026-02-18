import React, { useState } from 'react';

interface PublishModalProps {
    isOpen: boolean;
    currentVersion: string;
    onPublish: (version: string) => void;
    onCancel: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
    isOpen,
    currentVersion,
    onPublish,
    onCancel
}) => {
    const [version, setVersion] = useState(currentVersion);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic Semantic Versioning Validation (X.Y.Z)
        // const semanticRegex = /^\d+\.\d+\.\d+$/;
        // if (!semanticRegex.test(version)) {
        //     setError("Le format doit être X.Y.Z (ex: 1.0.2)");
        //     return;
        // }
        // For flexibility, we just ensure it's not empty and different/higher?
        // Let's just enforce string presence for now.
        if (!version.trim()) {
            setError("La version ne peut pas être vide.");
            return;
        }

        onPublish(version);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-parchment border-2 border-leather rounded-lg shadow-2xl p-6 max-w-md w-full m-4 relative">
                <button
                    onClick={onCancel}
                    className="absolute top-2 right-2 text-leather/50 hover:text-leather"
                >
                    ✕
                </button>

                <h3 className="text-xl font-bold text-leather mb-2 border-b border-leather/30 pb-2 font-serif">
                    Publier une nouvelle version
                </h3>

                <p className="text-sm text-leather-dark mb-4">
                    Cette action va envoyer votre base de données locale sur le serveur.
                    Veuillez indiquer le numéro de la nouvelle version.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 bg-leather/5 p-2 rounded border border-leather/10 text-center mb-6">
                        <span className="text-xs uppercase font-bold opacity-60 block">Version actuelle</span>
                        <span className="text-xl font-mono font-bold text-leather-dark">{currentVersion}</span>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase opacity-70 mb-1">Nouvelle Version</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-leather/30 rounded bg-input-bg text-leather focus:border-leather outline-none font-mono"
                            placeholder="ex: 1.0.0"
                            value={version}
                            onChange={(e) => {
                                setVersion(e.target.value);
                                setError(null);
                            }}
                            autoFocus
                        />
                        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-leather opacity-70 hover:opacity-100"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-700 text-white font-bold rounded shadow hover:bg-purple-800 transition-colors"
                        >
                            🚀 Publier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
