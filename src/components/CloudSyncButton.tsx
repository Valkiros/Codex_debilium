import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CharacterData } from '../types';

interface CloudSyncButtonProps {
    characterId: string;
    characterData: CharacterData;
}

export const CloudSyncButton: React.FC<CloudSyncButtonProps> = ({ characterId, characterData }) => {
    const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSync = async () => {
        setStatus('syncing');
        setMessage('');

        try {
            // 1. Prepare data payload
            const payload = {
                id: characterId, // UUID from local DB
                nom: characterData.identity.nom || 'Sans nom',
                data: characterData,
                updated_at: new Date().toISOString()
            };

            // 2. Upsert to Supabase 'personnages' table
            const { error } = await supabase
                .from('personnages')
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;

            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err: any) {
            console.error('Cloud Sync Error:', err);
            setStatus('error');
            if (err.code === '42P01') { // Undefined Table
                setMessage('Table "personnages" manquante dans Supabase.');
            } else {
                setMessage('Erreur: ' + (err.message || 'Inconnue'));
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            {message && <span className="text-xs text-red-500 font-bold animate-pulse">{message}</span>}

            <button
                onClick={handleSync}
                disabled={status === 'syncing'}
                className={`
                    px-3 py-1 rounded font-bold text-sm transition-all shadow-sm
                    ${status === 'idle' ? 'bg-leather text-parchment hover:bg-leather-dark' : ''}
                    ${status === 'syncing' ? 'bg-yellow-600 text-white cursor-wait' : ''}
                    ${status === 'success' ? 'bg-green-600 text-white' : ''}
                    ${status === 'error' ? 'bg-red-600 text-white' : ''}
                `}
                title={status === 'error' ? 'Cliquez pour réessayer' : 'Sauvegarder dans le Cloud'}
            >
                {status === 'idle' && '☁️ Cloud Save'}
                {status === 'syncing' && '⏳ Envoi...'}
                {status === 'success' && '✅ Sauvegardé !'}
                {status === 'error' && '❌ Erreur'}
            </button>
        </div>
    );
};
