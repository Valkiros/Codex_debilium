import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../constants';

import { useRefContext } from '../../context/RefContext';

export interface DatabaseUpdateHandle {
    checkForUpdates: (manual?: boolean) => Promise<void>;
}

interface DatabaseUpdateProps {
    onUpdateComplete?: () => void;
    onVersionDetected?: (local: string, remote: string) => void;
}

export const DatabaseUpdate = forwardRef<DatabaseUpdateHandle, DatabaseUpdateProps>(({ onUpdateComplete, onVersionDetected }, ref) => {
    const [status, setStatus] = useState<'checking' | 'up-to-date' | 'outdated' | 'updating' | 'error' | 'empty'>('checking');
    const [message, setMessage] = useState('');
    const [localVersion, setLocalVersion] = useState('');
    const [remoteVersion, setRemoteVersion] = useState('');

    // Get reloadRefs from context
    const { reloadRefs } = useRefContext();

    useImperativeHandle(ref, () => ({
        checkForUpdates: (manual = false) => checkVersions(manual)
    }));

    useEffect(() => {
        checkVersions(false);
    }, []);

    const checkVersions = async (manual = false) => {
        try {
            if (manual) setMessage("Vérification...");
            // Don't set status to 'checking' if manual, to avoid hiding if already visible?
            // Actually, if manual, we want to show feedback.
            // But 'checking' returns null (invisible) in current render logic.
            // We should probably just do the check.

            const localV = await invoke<string>('get_local_db_version');
            const localCount = await invoke<number>('get_local_items_count');
            setLocalVersion(localV);

            // Check Remote
            const remoteV = await invoke<string>('check_remote_db_version', {
                token: SUPABASE_ANON_KEY,
                supabaseUrl: SUPABASE_URL,
                supabaseKey: SUPABASE_ANON_KEY
            });
            setRemoteVersion(remoteV);

            if (onVersionDetected) {
                onVersionDetected(localV, remoteV);
            }

            console.log(`DB Check: Local=${localV} (Count=${localCount}), Remote=${remoteV}`);

            if (localCount === 0) {
                setStatus('empty'); // Force Update
                handleUpdate(); // Auto-start for empty DB
            } else {
                if (compareVersions(remoteV, localV) > 0) {
                    setStatus('outdated');
                } else {
                    setStatus('up-to-date');
                    if (manual) {
                        alert("La base de données est à jour !");
                    }
                }
            }
        } catch (err) {
            console.error("Failed to check DB version:", err);
            setStatus('error');
            setMessage('Erreur vérification BDD');
            if (manual) alert("Erreur lors de la vérification de la BDD: " + err);
        }
    };

    // Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
    const compareVersions = (v1: string, v2: string) => {
        // Strip non-numeric prefix if present (e.g. "v1.0.0" -> "1.0.0")
        const cleanV1 = v1.replace(/^[^\d]+/, '');
        const cleanV2 = v2.replace(/^[^\d]+/, '');

        const parts1 = cleanV1.split('.').map(Number);
        const parts2 = cleanV2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const val1 = parts1[i] || 0;
            const val2 = parts2[i] || 0;
            if (val1 > val2) return 1;
            if (val1 < val2) return -1;
        }
        return 0;
    };

    const handleUpdate = async () => {
        try {
            setStatus('updating');
            setMessage('Téléchargement de la base de données...');

            const res = await invoke<string>('sync_ref_items', {
                token: SUPABASE_ANON_KEY,
                supabaseUrl: SUPABASE_URL,
                supabaseKey: SUPABASE_ANON_KEY
            });

            setMessage(res);

            // RELOAD REFERENCES IN CONTEXT
            await reloadRefs();

            setStatus('up-to-date');
            if (onUpdateComplete) onUpdateComplete();

            // Re-check to sync local version state
            const newLocalV = await invoke<string>('get_local_db_version');
            setLocalVersion(newLocalV);
            if (onVersionDetected) {
                onVersionDetected(newLocalV, remoteVersion);
            }

        } catch (err: any) {
            console.error("Update failed:", err);
            setStatus('error');
            setMessage(`Erreur: ${err}`);
        }
    };

    if (status === 'up-to-date') return null; // Hidden when fine
    if (status === 'checking') return null; // Invisible check

    if (status === 'updating' || status === 'empty') {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-parchment p-8 rounded-lg shadow-2xl border-2 border-leather max-w-md text-center">
                    <h2 className="text-2xl font-bold text-leather mb-4 font-serif">Mise à jour de la Base de Données</h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather mx-auto mb-4"></div>
                    <p className="text-ink font-serif animate-pulse">{message || "Téléchargement en cours..."}</p>
                </div>
            </div>
        );
    }

    // Notification Bar for Outdated
    return (
        <div className="fixed bottom-4 right-4 bg-parchment border-2 border-gold p-4 rounded-lg shadow-xl z-50 max-w-sm animate-slide-in-right">
            <h4 className="font-bold text-leather text-sm mb-1">Mise à jour disponible</h4>
            <p className="text-xs text-ink mb-3">
                Votre base d'objets n'est pas à jour.
                <br />
                <span className="opacity-50">v{localVersion} {'->'} v{remoteVersion}</span>
            </p>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => setStatus('up-to-date')} // Dismiss
                    className="px-3 py-1 text-xs text-ink-light hover:text-ink transition-colors"
                >
                    Ignorer
                </button>
                <button
                    onClick={handleUpdate}
                    className="px-3 py-1 bg-leather text-parchment text-xs font-bold rounded hover:bg-leather-light transition-colors shadow-sm"
                >
                    Mettre à jour
                </button>
            </div>
        </div>
    );
});
