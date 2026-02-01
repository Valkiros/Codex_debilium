import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RefEquipement } from '../types';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';

interface AdminPanelProps {
    onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [items, setItems] = useState<RefEquipement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<RefEquipement> | null>(null);
    const [syncing, setSyncing] = useState(false);

    // Confirm Modal State
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
            console.log("Raw items from backend:", rawData);

            const mappedItems: RefEquipement[] = rawData.map(item => {
                // Helper to safely extract values
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

                    // Dégâts
                    degats: d.degats || '',
                    pi: d.pi || 0,

                    // Caractéristiques
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

                    // Protections
                    pr_sol: p.pr_sol || 0,
                    pr_mag: p.pr_mag || 0,
                    pr_spe: p.pr_spe || 0,
                    pluie: p.pluie || 0,
                    froid: p.froid || 0,
                    chaleur: p.chaleur || 0,

                    // Prix et monnaie
                    prix: pi.prix || 0,
                    monnaie: pi.monnaie || '',

                    // Details
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

                    // Craft
                    composants: craft.composants || '',
                    outils: craft.outils || '',
                    qualifications: craft.qualifications || '',
                    difficulte: craft.difficulte || 0,
                    temps_de_confection: craft.temps_de_confection || '',
                    confection: craft.confection || '',
                    xp_confection: craft.xp_confection || 0,
                    xp_reparation: craft.xp_reparation || 0,

                    // Keep raw for reference if needed
                    raw: item
                };
            });

            setItems(mappedItems);

            // Default to first category if not already set or valid
            if (mappedItems.length > 0) {
                const categories = Array.from(new Set(mappedItems.map(i => i.category))).sort();
                if (categories.length > 0) {
                    setSelectedCategory(prev => categories.includes(prev) && prev !== 'all' ? prev : categories[0]);
                }
            }
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

        // Construct JSON objects for Backend
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

        // Note: We cast refs to prevent TS errors, as RefEquipement in types.ts is still flat
        // but backend expects JSON objects. We rely on the backend command handling the JSON conversion/parsing.
        // Wait, backend expects JSON *Value* which Tauri handles automatically if we pass JS objects.
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
            alert("Erreur lors de la sauvegarde: " + error);
        }
    };

    const openEdit = (item: RefEquipement) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    // Modifier plus tard pour faire des schémas par catégorie
    const openNew = () => {
        setEditingItem({
            category: '',
            nom: '',
            poids: 0,
            pi: 0,
            rupture: '',
            pr_mag: 0,
            pr_spe: 0,
            type: '',
            aura: '',
            pluie: 0,
            froid: 0,
            chaleur: 0
        });
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const uniqueCategories = Array.from(new Set(items.map(i => i.category))).sort();

    const renderTableHeader = () => {
        switch (selectedCategory) {
            case 'Accessoires':
                return (
                    <>
                        <th className="p-3 text-center">Niveau</th>
                        <th className="p-3 text-center">Restriction</th>
                        <th className="p-3 text-center">Origine/Rareté</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-center">Aura</th>
                        <th className="p-3 text-center">Prix</th>
                        <th className="p-3 text-center">Monnaie</th>
                        <th className="p-3 text-center">PR sol</th>
                        <th className="p-3 text-center">PR spé</th>
                        <th className="p-3 text-center">PR mag</th>
                        <th className="p-3 text-center">PI</th>
                        <th className="p-3 text-center">Courage</th>
                        <th className="p-3 text-center">Intelligence</th>
                        <th className="p-3 text-center">Charisme</th>
                        <th className="p-3 text-center">Adresse</th>
                        <th className="p-3 text-center">Force</th>
                        <th className="p-3 text-center">Perception</th>
                        <th className="p-3 text-center">Esquive</th>
                        <th className="p-3 text-center">Attaque</th>
                        <th className="p-3 text-center">Parade</th>
                        <th className="p-3 text-center">Magie psy</th>
                        <th className="p-3 text-center">Magie phy</th>
                        <th className="p-3 text-center">Résistance magique</th>
                        <th className="p-3 text-center">Mouvement</th>
                        <th className="p-3 text-center">Discrétion</th>
                        <th className="p-3 text-center">Pluie</th>
                        <th className="p-3 text-center">Froid</th>
                        <th className="p-3 text-center">Chaleur</th>
                        <th className="p-3 text-center">Effet</th>
                        <th className="p-3 text-center">Rupture</th>
                        <th className="p-3 text-center">Poids</th>
                        <th className="p-3 text-center">Composants</th>
                        <th className="p-3 text-center">Outils</th>
                        <th className="p-3 text-center">Qualifications</th>
                        <th className="p-3 text-center">Difficulté</th>
                        <th className="p-3 text-center">Temps de confection</th>
                        <th className="p-3 text-center">Confection</th>
                        <th className="p-3 text-center">XP confection</th>
                        <th className="p-3 text-center">XP réparation</th>
                    </>
                );
            case 'Armes':
                return (
                    <>
                        <th className="p-3 text-center">Niveau</th>
                        <th className="p-3 text-center">Restriction</th>
                        <th className="p-3 text-center">Origine/Rareté</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-center">Aura</th>
                        <th className="p-3 text-center">Mains</th>
                        <th className="p-3 text-center">Prix</th>
                        <th className="p-3 text-center">Monnaie</th>
                        <th className="p-3 text-center">Dégâts</th>
                        <th className="p-3 text-center">Pi</th>
                        <th className="p-3 text-center">Courage</th>
                        <th className="p-3 text-center">Intelligence</th>
                        <th className="p-3 text-center">Charisme</th>
                        <th className="p-3 text-center">Adresse</th>
                        <th className="p-3 text-center">Force</th>
                        <th className="p-3 text-center">Perception</th>
                        <th className="p-3 text-center">Esquive</th>
                        <th className="p-3 text-center">Attaque</th>
                        <th className="p-3 text-center">Parade</th>
                        <th className="p-3 text-center">Effet</th>
                        <th className="p-3 text-center">Rupture</th>
                        <th className="p-3 text-center">Poids</th>
                        <th className="p-3 text-center">Composants</th>
                        <th className="p-3 text-center">Outils</th>
                        <th className="p-3 text-center">Qualifications</th>
                        <th className="p-3 text-center">Difficulté</th>
                        <th className="p-3 text-center">Temps de confection</th>
                        <th className="p-3 text-center">Confection</th>
                        <th className="p-3 text-center">XP confection</th>
                        <th className="p-3 text-center">XP réparation</th>
                    </>
                );
            case 'Armes de jet':
            case 'Boissons':
            case 'Bouffes':
            case 'Compétences':
            case 'Ingrédients':
            case 'Mains nues':
                return (
                    <>
                        <th className="p-3 text-center">Niveau</th>
                        <th className="p-3 text-center">Restriction</th>
                        <th className="p-3 text-center">Origine/Rareté</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-center">Aura</th>
                        <th className="p-3 text-center">Mains</th>
                        <th className="p-3 text-center">Prix</th>
                        <th className="p-3 text-center">Monnaie</th>
                        <th className="p-3 text-center">Dégâts</th>
                        <th className="p-3 text-center">Pi</th>
                        <th className="p-3 text-center">Courage</th>
                        <th className="p-3 text-center">Intelligence</th>
                        <th className="p-3 text-center">Charisme</th>
                        <th className="p-3 text-center">Adresse</th>
                        <th className="p-3 text-center">Force</th>
                        <th className="p-3 text-center">Perception</th>
                        <th className="p-3 text-center">Esquive</th>
                        <th className="p-3 text-center">Attaque</th>
                        <th className="p-3 text-center">Parade</th>
                        <th className="p-3 text-center">Effet</th>
                        <th className="p-3 text-center">Rupture</th>
                        <th className="p-3 text-center">Poids</th>
                        <th className="p-3 text-center">Composants</th>
                        <th className="p-3 text-center">Outils</th>
                        <th className="p-3 text-center">Qualifications</th>
                        <th className="p-3 text-center">Difficulté</th>
                        <th className="p-3 text-center">Temps de confection</th>
                        <th className="p-3 text-center">Confection</th>
                        <th className="p-3 text-center">XP confection</th>
                        <th className="p-3 text-center">XP réparation</th>
                    </>
                );
            case 'Munitions':
            case 'Objets magiques':
            case 'Objets spéciaux':
            case 'Outils':
            case 'Pièges':
            case 'Potions':
            case 'Protections':
                return (
                    <>
                        <th className="p-3 text-center">Niveau</th>
                        <th className="p-3 text-center">Restriction</th>
                        <th className="p-3 text-center">Origine/Rareté</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-center">Aura</th>
                        <th className="p-3 text-center">Matière</th>
                        <th className="p-3 text-center">Prix</th>
                        <th className="p-3 text-center">Monnaie</th>
                        <th className="p-3 text-center">PR sol</th>
                        <th className="p-3 text-center">PR spé</th>
                        <th className="p-3 text-center">PR mag</th>
                        <th className="p-3 text-center">Courage</th>
                        <th className="p-3 text-center">Intelligence</th>
                        <th className="p-3 text-center">Charisme</th>
                        <th className="p-3 text-center">Adresse</th>
                        <th className="p-3 text-center">Force</th>
                        <th className="p-3 text-center">Perception</th>
                        <th className="p-3 text-center">Esquive</th>
                        <th className="p-3 text-center">Attaque</th>
                        <th className="p-3 text-center">Parade</th>
                        <th className="p-3 text-center">Magie psy</th>
                        <th className="p-3 text-center">Magie phy</th>
                        <th className="p-3 text-center">Résistance magique</th>
                        <th className="p-3 text-center">Mouvement</th>
                        <th className="p-3 text-center">Discrétion</th>
                        <th className="p-3 text-center">Pluie</th>
                        <th className="p-3 text-center">Froid</th>
                        <th className="p-3 text-center">Chaleur</th>
                        <th className="p-3 text-center">Couvre</th>
                        <th className="p-3 text-center">Effet</th>
                        <th className="p-3 text-center">Rupture</th>
                        <th className="p-3 text-center">Poids</th>
                        <th className="p-3 text-center">Composants</th>
                        <th className="p-3 text-center">Outils</th>
                        <th className="p-3 text-center">Qualifications</th>
                        <th className="p-3 text-center">Difficulté</th>
                        <th className="p-3 text-center">Temps de confection</th>
                        <th className="p-3 text-center">Confection</th>
                        <th className="p-3 text-center">XP confection</th>
                        <th className="p-3 text-center">XP réparation</th>
                    </>
                );
            case 'Sacoches':
            case 'Sacs':

            default: // cases 'all'
                return (
                    <>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-center">Poids</th>
                        <th className="p-3 text-center">Stats (PI/PR/Rupt)</th>
                        <th className="p-3 text-center">Mag/Env</th>
                    </>
                );
        }
    };

    const renderTableRow = (item: RefEquipement) => {
        switch (selectedCategory) {
            case 'Accessoires':
                return (
                    <>
                        <td className="p-3 text-center">{item.niveau}</td>
                        <td className="p-3 text-center">{item.restriction}</td>
                        <td className="p-3 text-center">{item.origine_rarete}</td>
                        <td className="p-3 text-center">{item.type}</td>
                        <td className="p-3 text-center">{item.aura}</td>
                        <td className="p-3 text-center">{item.prix}</td>
                        <td className="p-3 text-center">{item.monnaie}</td>
                        <td className="p-3 text-center">{item.pr_sol}</td>
                        <td className="p-3 text-center">{item.pr_spe}</td>
                        <td className="p-3 text-center">{item.pr_mag}</td>
                        <td className="p-3 text-center">{item.pi}</td>
                        <td className="p-3 text-center">{item.courage}</td>
                        <td className="p-3 text-center">{item.intelligence}</td>
                        <td className="p-3 text-center">{item.charisme}</td>
                        <td className="p-3 text-center">{item.adresse}</td>
                        <td className="p-3 text-center">{item.force}</td>
                        <td className="p-3 text-center">{item.perception}</td>
                        <td className="p-3 text-center">{item.esquive}</td>
                        <td className="p-3 text-center">{item.attaque}</td>
                        <td className="p-3 text-center">{item.parade}</td>
                        <td className="p-3 text-center">{item.mag_psy}</td>
                        <td className="p-3 text-center">{item.mag_phy}</td>
                        <td className="p-3 text-center">{item.rm}</td>
                        <td className="p-3 text-center">{item.mvt}</td>
                        <td className="p-3 text-center">{item.discretion}</td>
                        <td className="p-3 text-center font-bold text-blue-800">{item.pluie}</td>
                        <td className="p-3 text-center font-bold text-blue-800">{item.froid}</td>
                        <td className="p-3 text-center font-bold text-blue-800">{item.chaleur}</td>
                        <td className="p-3 text-center">{item.effet}</td>
                        <td className="p-3 text-center">{item.rupture}</td>
                        <td className="p-3 text-center">{item.poids} g</td>
                        <td className="p-3 text-center">{item.composants}</td>
                        <td className="p-3 text-center">{item.outils}</td>
                        <td className="p-3 text-center">{item.qualifications}</td>
                        <td className="p-3 text-center">{item.difficulte}</td>
                        <td className="p-3 text-center">{item.temps_de_confection}</td>
                        <td className="p-3 text-center">{item.confection}</td>
                        <td className="p-3 text-center">{item.xp_confection}</td>
                        <td className="p-3 text-center">{item.xp_reparation}</td>
                    </>
                );
            case 'Armes':
                return (
                    <>
                        <td className="p-3 text-center">{item.niveau}</td>
                        <td className="p-3 text-center">{item.restriction}</td>
                        <td className="p-3 text-center">{item.origine_rarete}</td>
                        <td className="p-3 text-center">{item.type}</td>
                        <td className="p-3 text-center">{item.aura}</td>
                        <td className="p-3 text-center">{item.mains}</td>
                        <td className="p-3 text-center">{item.prix}</td>
                        <td className="p-3 text-center">{item.monnaie}</td>
                        <td className="p-3 text-center">{item.degats}</td>
                        <td className="p-3 text-center">{item.pi}</td>
                        <td className="p-3 text-center">{item.courage}</td>
                        <td className="p-3 text-center">{item.intelligence}</td>
                        <td className="p-3 text-center">{item.charisme}</td>
                        <td className="p-3 text-center">{item.adresse}</td>
                        <td className="p-3 text-center">{item.force}</td>
                        <td className="p-3 text-center">{item.perception}</td>
                        <td className="p-3 text-center">{item.esquive}</td>
                        <td className="p-3 text-center">{item.attaque}</td>
                        <td className="p-3 text-center">{item.parade}</td>
                        <td className="p-3 text-center">{item.effet}</td>
                        <td className="p-3 text-center">{item.rupture}</td>
                        <td className="p-3 text-center">{item.poids} g</td>
                        <td className="p-3 text-center">{item.composants}</td>
                        <td className="p-3 text-center">{item.outils}</td>
                        <td className="p-3 text-center">{item.qualifications}</td>
                        <td className="p-3 text-center">{item.difficulte}</td>
                        <td className="p-3 text-center">{item.temps_de_confection}</td>
                        <td className="p-3 text-center">{item.confection}</td>
                        <td className="p-3 text-center">{item.xp_confection}</td>
                        <td className="p-3 text-center">{item.xp_reparation}</td>
                    </>
                );
            case 'Armes de jet':
            case 'Boissons':
            case 'Bouffes':
            case 'Compétences':
            case 'Ingrédients':
            case 'Mains nues':
                return (
                    <>
                        <td className="p-3 text-center">{item.niveau}</td>
                        <td className="p-3 text-center">{item.restriction}</td>
                        <td className="p-3 text-center">{item.origine_rarete}</td>
                        <td className="p-3 text-center">{item.type}</td>
                        <td className="p-3 text-center">{item.aura}</td>
                        <td className="p-3 text-center">{item.mains}</td>
                        <td className="p-3 text-center">{item.prix}</td>
                        <td className="p-3 text-center">{item.monnaie}</td>
                        <td className="p-3 text-center">{item.degats}</td>
                        <td className="p-3 text-center">{item.pi}</td>
                        <td className="p-3 text-center">{item.courage}</td>
                        <td className="p-3 text-center">{item.intelligence}</td>
                        <td className="p-3 text-center">{item.charisme}</td>
                        <td className="p-3 text-center">{item.adresse}</td>
                        <td className="p-3 text-center">{item.force}</td>
                        <td className="p-3 text-center">{item.perception}</td>
                        <td className="p-3 text-center">{item.esquive}</td>
                        <td className="p-3 text-center">{item.attaque}</td>
                        <td className="p-3 text-center">{item.parade}</td>
                        <td className="p-3 text-center">{item.effet}</td>
                        <td className="p-3 text-center">{item.rupture}</td>
                        <td className="p-3 text-center">{item.poids} g</td>
                        <td className="p-3 text-center">{item.composants}</td>
                        <td className="p-3 text-center">{item.outils}</td>
                        <td className="p-3 text-center">{item.qualifications}</td>
                        <td className="p-3 text-center">{item.difficulte}</td>
                        <td className="p-3 text-center">{item.temps_de_confection}</td>
                        <td className="p-3 text-center">{item.confection}</td>
                        <td className="p-3 text-center">{item.xp_confection}</td>
                        <td className="p-3 text-center">{item.xp_reparation}</td>
                    </>
                );
            case 'Munitions':
            case 'Objets magiques':
            case 'Objets spéciaux':
            case 'Outils':
            case 'Pièges':
            case 'Potions':
            case 'Protections':
                return (
                    <>
                        <td className="p-3 text-center">{item.niveau}</td>
                        <td className="p-3 text-center">{item.restriction}</td>
                        <td className="p-3 text-center">{item.origine_rarete}</td>
                        <td className="p-3 text-center">{item.type}</td>
                        <td className="p-3 text-center">{item.aura}</td>
                        <td className="p-3 text-center">{item.matiere}</td>
                        <td className="p-3 text-center">{item.prix}</td>
                        <td className="p-3 text-center">{item.monnaie}</td>
                        <td className="p-3 text-center">{item.pr_sol}</td>
                        <td className="p-3 text-center">{item.pr_spe}</td>
                        <td className="p-3 text-center">{item.pr_mag}</td>
                        <td className="p-3 text-center">{item.courage}</td>
                        <td className="p-3 text-center">{item.intelligence}</td>
                        <td className="p-3 text-center">{item.charisme}</td>
                        <td className="p-3 text-center">{item.adresse}</td>
                        <td className="p-3 text-center">{item.force}</td>
                        <td className="p-3 text-center">{item.perception}</td>
                        <td className="p-3 text-center">{item.esquive}</td>
                        <td className="p-3 text-center">{item.attaque}</td>
                        <td className="p-3 text-center">{item.parade}</td>
                        <td className="p-3 text-center">{item.mag_psy}</td>
                        <td className="p-3 text-center">{item.mag_phy}</td>
                        <td className="p-3 text-center">{item.rm}</td>
                        <td className="p-3 text-center">{item.mvt}</td>
                        <td className="p-3 text-center">{item.discretion}</td>
                        <td className="p-3 text-center">{item.pluie}</td>
                        <td className="p-3 text-center">{item.froid}</td>
                        <td className="p-3 text-center">{item.chaleur}</td>
                        <td className="p-3 text-center">{item.couvre}</td>
                        <td className="p-3 text-center">{item.effet}</td>
                        <td className="p-3 text-center">{item.rupture}</td>
                        <td className="p-3 text-center">{item.poids} g</td>
                        <td className="p-3 text-center">{item.composants}</td>
                        <td className="p-3 text-center">{item.outils}</td>
                        <td className="p-3 text-center">{item.qualifications}</td>
                        <td className="p-3 text-center">{item.difficulte}</td>
                        <td className="p-3 text-center">{item.temps_de_confection}</td>
                        <td className="p-3 text-center">{item.confection}</td>
                        <td className="p-3 text-center">{item.xp_confection}</td>
                        <td className="p-3 text-center">{item.xp_reparation}</td>
                    </>
                );
            case 'Sacoches':
            case 'Sacs':

            default: // cases 'all'
                return (
                    <>
                        <td className="p-3 opacity-80">{item.type}</td>
                        <td className="p-3 text-center">{item.poids} g</td>
                        <td className="p-3 text-center text-xs">
                            <div>PI: {item.pi}</div>
                            <div>Rupt: {item.rupture}</div>
                        </td>
                        <td className="p-3 text-center text-xs">
                            <div>Mag: {item.pr_mag} / Spé: {item.pr_spe}</div>
                            <div>Env: P{item.pluie}/F{item.froid}/C{item.chaleur}</div>
                        </td>
                    </>
                );
        }
    };

    return (
        <div className="py-6 px-[200px] w-full">
            <div className="flex justify-between items-center mb-6 border-b border-leather/20 pb-2">
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

            <div className="flex justify-between items-center mb-4 gap-4">
                <div className="flex gap-2 items-center flex-1">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="p-2 border border-leather/30 rounded w-64 bg-white/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 border border-leather/30 rounded bg-white/50"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
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

            <div className="bg-white/40 rounded shadow overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-leather text-parchment uppercase text-xs">
                        <tr>
                            <th className="p-3">Catégorie</th>
                            <th className="p-3 text-center">ID</th>
                            <th className="p-3">Nom</th>
                            {/* Dynamic Headers */}
                            {renderTableHeader()}
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-leather/10">
                        {loading ? (
                            <tr><td colSpan={12} className="p-4 text-center">Chargement...</td></tr>
                        ) : filteredItems.map(item => (
                            <tr key={item.id} className="hover:bg-white/30 transition-colors">
                                <td className="p-3 font-semibold text-leather-light">{item.category}</td>
                                <td className="p-3 text-center text-xs opacity-50 font-mono">{item.ref_id}</td>
                                <td className="p-3 font-bold text-leather-dark">
                                    {item.nom}
                                    {item.effet && <span className="block text-[10px] font-normal opacity-60 truncate max-w-[200px]">{item.effet}</span>}
                                </td>

                                {renderTableRow(item)}

                                <td className="p-3 text-right whitespace-nowrap">
                                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2">✏️</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-parchment p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-leather">
                        <h3 className="text-xl font-bold mb-4 border-b border-leather/20 pb-2">
                            {editingItem.id ? 'Éditer' : 'Créer'} un objet
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Catégorie</label>
                                    <select
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    >
                                        <option value="Armes">Armes</option>
                                        <option value="Protections">Protections</option>
                                        <option value="Mains_nues">Mains Nues</option>
                                        <option value="Accessoires">Accessoires</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Nom</label>
                                    <input
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.nom}
                                        onChange={(e) => setEditingItem({ ...editingItem, nom: e.target.value })}
                                        required />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Type (Sous-catégorie)</label>
                                    <input
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.type}
                                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Poids (g)</label>
                                    <input type="number" step="0.1"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.poids}
                                        onChange={(e) => setEditingItem({ ...editingItem, poids: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Rupture</label>
                                    <input
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.rupture}
                                        onChange={(e) => setEditingItem({ ...editingItem, rupture: e.target.value })}
                                    />
                                </div>
                            </div>

                            <h4 className="font-bold text-sm bg-leather/10 p-1">Caractéristiques de Combat</h4>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">PI (Arme)</label>
                                    <input type="number"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.pi}
                                        onChange={(e) => setEditingItem({ ...editingItem, pi: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Dégats / PR (Protection)</label>
                                    <input
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.degats}
                                        onChange={(e) => setEditingItem({ ...editingItem, degats: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">PR Magique</label>
                                    <input type="number"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.pr_mag}
                                        onChange={(e) => setEditingItem({ ...editingItem, pr_mag: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">PR Spéciale</label>
                                    <input type="number"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.pr_spe}
                                        onChange={(e) => setEditingItem({ ...editingItem, pr_spe: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Aura</label>
                                    <input
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.aura}
                                        onChange={(e) => setEditingItem({ ...editingItem, aura: e.target.value })}
                                    />
                                </div>
                            </div>

                            <h4 className="font-bold text-sm bg-leather/10 p-1">Protection Environnementale</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Pluie</label>
                                    <input type="number"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.pluie}
                                        onChange={(e) => setEditingItem({ ...editingItem, pluie: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Froid</label>
                                    <input type="number"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.froid}
                                        onChange={(e) => setEditingItem({ ...editingItem, froid: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase opacity-70">Chaleur</label>
                                    <input type="number"
                                        className="w-full p-2 border rounded bg-white/50"
                                        value={editingItem.chaleur}
                                        onChange={(e) => setEditingItem({ ...editingItem, chaleur: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase opacity-70">Effet</label>
                                <textarea
                                    className="w-full p-2 border rounded bg-white/50 h-24"
                                    value={editingItem.effet}
                                    onChange={(e) => setEditingItem({ ...editingItem, effet: e.target.value })}
                                />
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
