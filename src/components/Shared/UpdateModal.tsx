import React from 'react';
import { Update } from '@tauri-apps/plugin-updater';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'uptodate' | 'error' | 'downloading';

interface UpdateModalProps {
    status: UpdateStatus;
    updateInfo: Update | null;
    errorMsg: string | null;
    onClose: () => void;
    onInstall: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
    status,
    updateInfo,
    errorMsg,
    onClose,
    onInstall
}) => {
    if (status === 'idle') return null;

    // Helper to render content based on status
    const renderContent = () => {
        switch (status) {
            case 'checking':
                return (
                    <div className="flex flex-col items-center py-8">
                        <svg className="animate-spin h-10 w-10 text-leather mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-leather font-bold text-lg">Recherche de mises à jour...</p>
                    </div>
                );

            case 'uptodate':
                return (
                    <div className="flex flex-col items-center py-6">
                        <div className="text-5xl mb-4">✨</div>
                        <h3 className="text-xl font-bold text-leather mb-2">Tout est à jour !</h3>
                        <p className="text-leather-dark text-center">Vous utilisez la dernière version du Codex.</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-leather text-parchment font-bold rounded hover:bg-leather-light transition-colors"
                        >
                            Parfait
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex flex-col items-center py-6">
                        <div className="text-5xl mb-4">📜</div>
                        <h3 className="text-xl font-bold text-leather mb-2">Pas de mise à jour trouvée</h3>
                        <p className="text-leather-dark text-center italic opacity-80 mb-4 px-4">
                            {errorMsg === "Could not fetch a valid release JSON from the remote"
                                ? "Aucune nouvelle version n'est disponible pour le moment."
                                : errorMsg}
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-leather text-parchment font-bold rounded hover:bg-leather-light transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                );

            case 'available':
                return (
                    <div className="flex flex-col relative">
                        <h3 className="text-2xl font-bold text-leather mb-1">Nouvelle Version : {updateInfo?.version}</h3>
                        <p className="text-sm text-leather/60 mb-4">
                            {updateInfo?.date ? new Date(updateInfo.date).toLocaleDateString() : ''}
                        </p>

                        <div className="bg-white/30 p-4 rounded border border-leather/20 max-h-60 overflow-y-auto mb-6">
                            <p className="font-bold text-leather mb-2">Notes de mise à jour :</p>
                            <p className="text-leather-dark whitespace-pre-wrap">{updateInfo?.body || "Aucune note disponible."}</p>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-leather hover:bg-leather/10 rounded font-bold transition-colors"
                            >
                                Plus tard
                            </button>
                            <button
                                onClick={onInstall}
                                className="px-6 py-2 bg-green-700 text-white font-bold rounded hover:bg-green-800 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Installer et Redémarrer
                            </button>
                        </div>
                    </div>
                );
            case 'downloading':
                return (
                    <div className="flex flex-col items-center py-8">
                        <svg className="animate-spin h-10 w-10 text-green-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-leather font-bold text-lg">Téléchargement et Installation...</p>
                        <p className="text-sm text-leather/60 mt-2">L'application redémarrera automatiquement.</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-parchment border-2 border-leather rounded-lg shadow-2xl p-6 max-w-lg w-full m-4 relative">
                {/* Decorative Corner Borders if we want to mimic ConfirmModal style exactly, 
                     but ConfirmModal is simple. Converting to 'parchment' style usually implies 
                     some texture or color which provides layout context. */}

                {renderContent()}
            </div>
        </div>
    );
};
