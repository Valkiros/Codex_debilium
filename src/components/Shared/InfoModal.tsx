import React from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    appVersion: string;
    dbVersionLocal: string;
    dbVersionRemote: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    onClose,
    appVersion,
    dbVersionLocal,
    dbVersionRemote
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-parchment border-2 border-leather rounded-lg shadow-2xl p-6 max-w-sm w-full m-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-leather/50 hover:text-leather"
                >
                    ✕
                </button>

                <h3 className="text-xl font-bold text-leather mb-4 border-b border-leather/30 pb-2 font-serif">
                    Informations
                </h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-leather-dark">Version Logiciel :</span>
                        <span className="font-mono bg-leather/10 px-2 py-1 rounded text-leather-dark">v{appVersion}</span>
                    </div>

                    <div className="border-t border-leather/10 my-2"></div>

                    <div className="flex justify-between items-center">
                        <span className="font-bold text-leather-dark">Version BDD :</span>
                        <div className="text-right">
                            <div className="font-mono bg-leather/10 px-2 py-1 rounded text-leather-dark mb-1">
                                Local : {dbVersionLocal}
                            </div>
                            <div className="text-xs text-leather/60">
                                (Serveur : {dbVersionRemote})
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-leather text-parchment font-bold rounded hover:bg-leather-light transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};
