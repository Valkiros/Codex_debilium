import React, { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RefEquipement } from '../types';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { CATEGORY_SCHEMAS } from './AdminSchemas';
import { TableColumnFilter } from './TableColumnFilter';

interface AdminPanelProps {
    onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [items, setItems] = useState<RefEquipement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Armes');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<RefEquipement> | null>(null);
    const [syncing, setSyncing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // Filters state: key is the field key, value is array of selected strings
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmLabel?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

    const handleSync = () => {
        setConfirmState({
            isOpen: true,
            title: "Synchronisation Cloud",
            message: "Attention : Cette action va remplacer toutes les données locales d'équipement par celles de la base de données distante. Continuer ?",
            confirmLabel: "Synchroniser",
            onConfirm: performSync
        });
    };

    const performSync = async () => {
        closeConfirm();
        setSyncing(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Erreur : Vous devez être connecté pour synchroniser.");
                return;
            }

            const token = session.access_token;
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const result = await invoke('sync_ref_items', {
                token,
                supabaseUrl,
                supabaseKey
            });

            alert(result);
            fetchItems();
        } catch (error) {
            console.error("Sync failed:", error);
            alert("Erreur de synchronisation : " + error);
        } finally {
            setSyncing(false);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const rawData = await invoke('get_ref_items') as any[];


            const mappedItems: RefEquipement[] = rawData.map(item => {
                const d = item.degats || {};
                const c = item.caracteristiques || {};
                const p = item.protections || {};
                const pi = item.prix_info || {};
                const det = item.details || {};
                const craft = item.craft || {};

                return {
                    id: item.id,
                    ref_id: item.ref_id,
                    category: item.category,
                    nom: item.nom,

                    degats: d.degats || '',
                    pi: d.pi || 0,

                    courage: c.courage || 0,
                    intelligence: c.intelligence || 0,
                    charisme: c.charisme || 0,
                    adresse: c.adresse || 0,
                    force: c.force || 0,
                    perception: c.perception || 0,
                    esquive: c.esquive || 0,
                    attaque: c.attaque || 0,
                    parade: c.parade || 0,
                    mag_psy: c.mag_psy || 0,
                    mag_phy: c.mag_phy || 0,
                    rm: c.rm || 0,
                    mvt: c.mvt || 0,
                    discretion: c.discretion || 0,

                    pr_sol: p.pr_sol || 0,
                    pr_mag: p.pr_mag || 0,
                    pr_spe: p.pr_spe || 0,
                    pluie: p.pluie || 0,
                    froid: p.froid || 0,
                    chaleur: p.chaleur || 0,

                    prix: pi.prix || 0,
                    monnaie: pi.monnaie || '',

                    niveau: det.niveau || 0,
                    restriction: det.restriction || '',
                    origine_rarete: det["origine/rarete"] || '',
                    type: det.type || '',
                    contenant: det.contenant || '',
                    portee: det.portee || '',
                    aura: det.aura || '',
                    mains: det.mains || '',
                    matiere: det.matiere || '',
                    couvre: det.couvre || '',
                    effet: det.effet || '',
                    charge: det.charge || 0,
                    capacite: det.capacite || 0,
                    places: det.places || 0,
                    poids: det.poids || 0,
                    rupture: det.rupture || '',
                    recolte: det.recolte || '',
                    peremption: det.peremption || '',

                    composants: craft.composants || '',
                    outils: craft.outils || '',
                    qualifications: craft.qualifications || '',
                    difficulte: craft.difficulte || 0,
                    temps_de_confection: craft.temps_de_confection || '',
                    confection: craft.confection || '',
                    xp_confection: craft.xp_confection || 0,
                    xp_reparation: craft.xp_reparation || 0,

                    raw: item
                };
            });

            setItems(mappedItems);
        } catch (error) {
            console.error("Failed to fetch items:", error);
            alert("Erreur lors du chargement des objets: " + error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, filters]);

    const handleDelete = (id: number) => {
        setConfirmState({
            isOpen: true,
            title: "Suppression d'objet",
            message: "Êtes-vous sûr de vouloir supprimer cet objet ?",
            confirmLabel: "Supprimer",
            onConfirm: () => performDelete(id)
        });
    };

    const performDelete = async (id: number) => {
        closeConfirm();
        try {
            await invoke('delete_ref_equipement', { id });
            fetchItems();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Erreur lors de la suppression");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const degats = {
            pi: editingItem.pi || 0,
            degats: editingItem.degats || ''
        };

        const caracteristiques = {
            courage: editingItem.courage || 0,
            intelligence: editingItem.intelligence || 0,
            charisme: editingItem.charisme || 0,
            adresse: editingItem.adresse || 0,
            force: editingItem.force || 0,
            perception: editingItem.perception || 0,
            esquive: editingItem.esquive || 0,
            attaque: editingItem.attaque || 0,
            parade: editingItem.parade || 0,
            mag_psy: editingItem.mag_psy || 0,
            mag_phy: editingItem.mag_phy || 0,
            rm: editingItem.rm || 0,
            mvt: editingItem.mvt || 0,
            discretion: editingItem.discretion || 0,
        };

        const protections = {
            pr_sol: editingItem.pr_sol || 0,
            pr_mag: editingItem.pr_mag || 0,
            pr_spe: editingItem.pr_spe || 0,
            pluie: editingItem.pluie || 0,
            froid: editingItem.froid || 0,
            chaleur: editingItem.chaleur || 0
        };

        const prix_info = {
            prix: editingItem.prix || 0,
            monnaie: editingItem.monnaie || ''
        };

        const craft = {
            composants: editingItem.composants || '',
            outils: editingItem.outils || '',
            qualifications: editingItem.qualifications || '',
            difficulte: editingItem.difficulte || 0,
            temps_de_confection: editingItem.temps_de_confection || '',
            confection: editingItem.confection || '',
            xp_confection: editingItem.xp_confection || 0,
            xp_reparation: editingItem.xp_reparation || 0,
        };

        const details = {
            niveau: editingItem.niveau || 0,
            restriction: editingItem.restriction || '',
            origine_rarete: editingItem.origine_rarete || '',
            type: editingItem.type || '',
            contenant: editingItem.contenant || '',
            portee: editingItem.portee || '',
            aura: editingItem.aura || '',
            mains: editingItem.mains || '',
            matiere: editingItem.matiere || '',
            couvre: editingItem.couvre || '',
            effet: editingItem.effet || '',
            charge: editingItem.charge || 0,
            capacite: editingItem.capacite || 0,
            places: editingItem.places || 0,
            poids: editingItem.poids || 0,
            rupture: editingItem.rupture || '',
            recolte: editingItem.recolte || '',
            peremption: editingItem.peremption || ''
        };

        const payload = {
            category: editingItem.category,
            ref_id: editingItem.ref_id,
            nom: editingItem.nom,
            degats,
            caracteristiques,
            protections,
            prix_info,
            craft,
            details
        };

        try {
            if (editingItem.id) {
                await invoke('update_ref_equipement', {
                    id: editingItem.id,
                    ...payload
                });
            } else {
                await invoke('create_ref_equipement', payload);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            fetchItems();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Erreur lors du sauvegarde: " + error);
        }
    };

    const openEdit = (item: RefEquipement) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingItem({
            category: selectedCategory,
            nom: '',
            poids: 0,
            pi: 0,
        });
        setIsModalOpen(true);
    };

    const currentSchema = useMemo(() => {
        return CATEGORY_SCHEMAS[selectedCategory] || CATEGORY_SCHEMAS['Default'];
    }, [selectedCategory]);

    // Compute unique values for filtering
    const uniqueValues = useMemo(() => {
        const values: Record<string, string[]> = {};

        // Add basic fields logic
        values['nom'] = Array.from(new Set(items.map(i => i.category === selectedCategory ? i.nom : null).filter(Boolean))) as string[];

        // Add schema fields
        currentSchema.forEach(field => {
            const distinct = new Set<string>();
            items.forEach(item => {
                if (item.category === selectedCategory || selectedCategory === 'all') { // Filtering only for current view
                    const val = (item as any)[field.key];
                    if (val !== undefined && val !== null) {
                        distinct.add(String(val));
                    }
                }
            });
            values[field.key as string] = Array.from(distinct).sort();
        });
        return values;
    }, [items, selectedCategory, currentSchema]);


    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

            // Global Search
            const globalMatch = !searchTerm ||
                item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(item.ref_id).includes(searchTerm);

            if (!globalMatch) return false;

            // Excel-like Filters (Array inclusion)
            for (const key in filters) {
                const selectedOptions = filters[key];
                if (selectedOptions && selectedOptions.length > 0) {
                    const itemValue = String((item as any)[key] || '');
                    if (!selectedOptions.includes(itemValue)) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [items, selectedCategory, searchTerm, filters]);

    // Apply Pagination
    const currentItems = useMemo(() => {
        // If itemsPerPage is very large, show all
        if (itemsPerPage > filteredItems.length) {
            return filteredItems;
        }
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredItems.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredItems.length));
    }, [filteredItems, currentPage, itemsPerPage]);

    const uniqueCategories = useMemo(() => Array.from(new Set(items.map(i => i.category))).sort(), [items]);

    const handleFilterChange = (key: string, values: string[]) => {
        setFilters(prev => ({
            ...prev,
            [key]: values
        }));
    };

    // Pagination Helpers
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="fixed inset-0 w-full h-full flex flex-col bg-parchment p-4 box-border overflow-hidden overscroll-none z-50">
            <div className="flex justify-between items-center mb-6 border-b border-leather/20 pb-2 flex-shrink-0">
                <h2 className="text-2xl font-bold font-serif text-leather-dark">
                    Administration de la Base de Données
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`text-sm px-3 py-1 border border-leather/30 rounded text-leather ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/50'}`}
                    >
                        {syncing ? 'Synchronisation...' : 'Synchroniser (Cloud)'}
                    </button>
                    <button
                        onClick={onBack}
                        className="text-sm px-3 py-1 border border-leather/30 rounded hover:bg-white/50 text-leather"
                    >
                        Retour
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 gap-4 flex-shrink-0">
                <div className="flex gap-2 items-center flex-1">
                    <input
                        type="text"
                        placeholder="Recherche globale..."
                        className="p-2 border border-leather/30 rounded w-64 bg-white/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 border border-leather/30 rounded bg-white/50"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setFilters({});
                        }}
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={openNew}
                    className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 whitespace-nowrap"
                >
                    + Ajouter un objet
                </button>
            </div>

            <div className="bg-white/40 rounded shadow flex-1 overflow-hidden flex flex-col relative border border-leather/20">
                <div className="overflow-x-auto overflow-y-auto flex-1 w-full">
                    <table className="text-left text-sm border-collapse min-w-full">
                        <thead className="bg-leather text-parchment uppercase text-xs sticky top-0 z-30 shadow-md">
                            <tr>
                                <th className="p-3 sticky left-0 bg-leather z-40 min-w-[300px] shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                                    <div className="flex items-center justify-between">
                                        Nom
                                        <TableColumnFilter
                                            columnKey="nom"
                                            label="Nom"
                                            options={uniqueValues['nom'] || []}
                                            selectedValues={filters['nom'] || []}
                                            onChange={(vals) => handleFilterChange('nom', vals)}
                                        />
                                    </div>
                                </th>
                                <th className="p-3 text-center min-w-[60px] border-l border-leather-light/20">ID</th>
                                {currentSchema.map(field => (
                                    <th key={String(field.key)} className="p-3 text-center whitespace-nowrap border-l border-leather-light/20" style={{ minWidth: field.width || '100px' }}>
                                        <div className="flex items-center justify-between">
                                            {field.label}
                                            <TableColumnFilter
                                                columnKey={String(field.key)}
                                                label={field.label}
                                                options={uniqueValues[field.key as string] || []}
                                                selectedValues={filters[field.key as string] || []}
                                                onChange={(vals) => handleFilterChange(field.key as string, vals)}
                                            />
                                        </div>
                                    </th>
                                ))}
                                <th className="p-3 text-right sticky right-0 bg-leather z-40 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-leather/10">
                            {loading ? (
                                <tr><td colSpan={currentSchema.length + 3} className="p-4 text-center">Chargement...</td></tr>
                            ) : currentItems.map(item => (
                                <tr key={item.id} className="hover:bg-white/50 transition-colors group bg-white/20 odd:bg-white/10">
                                    <td className="p-2 font-bold text-leather-dark sticky left-0 bg-parchment/90 group-hover:bg-parchment z-20 border-r border-leather/10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                        {item.nom}
                                    </td>
                                    <td className="p-2 text-center text-xs opacity-50 font-mono">
                                        {item.ref_id}
                                    </td>
                                    {currentSchema.map(field => (
                                        <td key={`${item.id}-${field.key}`} className="p-2 text-center truncate max-w-[200px] border-l border-leather/5" title={String((item as any)[field.key] || '')}>
                                            {(item as any)[field.key]}
                                        </td>
                                    ))}
                                    <td className="p-2 text-right whitespace-nowrap sticky right-0 bg-parchment/90 group-hover:bg-parchment z-20 border-l border-leather/10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                                        <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2 p-1 hover:bg-white/50 rounded" title="Modifier">✏️</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-white/50 rounded" title="Supprimer">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-2 bg-parchment border-t border-leather/20 flex items-center justify-between text-xs sticky bottom-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-leather-dark">Afficher :</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="p-1 border border-leather/30 rounded bg-white/50 cursor-pointer hover:bg-white/80"
                        >
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={500}>500</option>
                            <option value={999999}>Tout</option>
                        </select>
                        <span className="text-leather-light ml-2 border-l border-leather/20 pl-2">
                            Total : <span className="font-bold">{filteredItems.length}</span> élément(s)
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-leather/30 rounded disabled:opacity-30 enabled:hover:bg-leather enabled:hover:text-parchment transition-colors font-bold"
                            title="Page précédente"
                        >
                            &lt;
                        </button>
                        <span className="px-3 font-mono">
                            Page {currentPage} / {Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-1 border border-leather/30 rounded disabled:opacity-30 enabled:hover:bg-leather enabled:hover:text-parchment transition-colors font-bold"
                            title="Page suivante"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-parchment p-6 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-leather flex flex-col">
                        <h3 className="text-xl font-bold mb-4 border-b border-leather/20 pb-2 flex-shrink-0">
                            {editingItem.id ? 'Éditer' : 'Créer'} : {editingItem.category}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">Catégorie</label>
                                    <select
                                        className="w-full p-2 border border-leather/30 rounded bg-white/50"
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        disabled={!!editingItem.id}
                                    >
                                        {uniqueCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">Nom</label>
                                    <input
                                        className="w-full p-2 border border-leather/30 rounded bg-white/50"
                                        value={editingItem.nom}
                                        onChange={(e) => setEditingItem({ ...editingItem, nom: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/20 rounded border border-leather/10">
                                {currentSchema.map(field => (
                                    <div key={String(field.key)} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                                        <label className="block text-[10px] font-bold uppercase opacity-70 mb-1">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                className="w-full p-2 border border-leather/30 rounded bg-white/50 min-h-[60px] text-sm"
                                                value={(editingItem as any)[field.key] || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, [field.key as string]: e.target.value })}
                                            />
                                        ) : field.type === 'select' && field.options ? (
                                            <select
                                                className="w-full p-2 border border-leather/30 rounded bg-white/50 text-sm"
                                                value={(editingItem as any)[field.key] || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, [field.key as string]: e.target.value })}
                                            >
                                                <option value="">-</option>
                                                {field.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                step={field.type === 'number' ? "0.01" : undefined}
                                                className="w-full p-2 border border-leather/30 rounded bg-white/50 text-sm"
                                                value={(editingItem as any)[field.key] || ''}
                                                onChange={(e) => {
                                                    const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                                    setEditingItem({ ...editingItem, [field.key as string]: val });
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-leather/20">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-leather opacity-70 hover:opacity-100">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-leather text-parchment font-bold rounded shadow hover:bg-leather-dark">Sauvegarder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={closeConfirm}
                confirmLabel={confirmState.confirmLabel}
            />
        </div>
    );
};
