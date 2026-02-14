import React from 'react';

interface AdBonusModalProps {
    isOpen: boolean;
    onChoose: (choice: 'AT' | 'PRD') => void;
}

export const AdBonusModal: React.FC<AdBonusModalProps> = ({ isOpen, onChoose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-parchment border-2 border-leather rounded-lg shadow-2xl p-6 max-w-md w-full relative">
                <h2 className="text-xl font-bold text-center text-leather mb-4 border-b border-leather/30 pb-2">
                    Bonus d'Adresse Exceptionnelle
                </h2>

                <p className="text-leather-dark mb-6 text-center">
                    Votre Adresse naturelle a dépassé 12 !<br />
                    Vous avez développé une habileté martiale supérieure. Choisissez un bonus permanent :
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => onChoose('AT')}
                        className="px-6 py-3 bg-red-800 text-parchment font-bold rounded hover:bg-red-900 transition-colors shadow-md border border-leather-dark"
                    >
                        +1 Attaque (AT)
                    </button>

                    <button
                        onClick={() => onChoose('PRD')}
                        className="px-6 py-3 bg-blue-800 text-parchment font-bold rounded hover:bg-blue-900 transition-colors shadow-md border border-leather-dark"
                    >
                        +1 Parade (PRD)
                    </button>
                </div>

                <p className="text-xs text-center text-leather/60 mt-4 italic">
                    Ce choix est définitif.
                </p>
            </div>
        </div>
    );
};
