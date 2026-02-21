import React, { useState, useMemo } from 'react';
import { CatalogueItem, RefEquipement } from '../../../types';
import { useRefContext } from '../../../context/RefContext';
import { SacItemSelector } from '../Sac/SacItemSelector';
import { v4 as uuidv4 } from 'uuid';
import { GiOpenBook, GiTrashCan, GiEyeTarget } from 'react-icons/gi';
import { getItemWeight } from '../../../utils/sacUtils';
import { CATEGORY_SCHEMAS, FieldDef } from '../../../utils/AdminSchemas';

interface CatalogueProps {
    items: CatalogueItem[];
    onItemsChange: (items: CatalogueItem[]) => void;
}

export const Catalogue: React.FC<CatalogueProps> = ({ items = [], onItemsChange }) => {
    const { refs } = useRefContext();
    const [isGlobalCondensed, setIsGlobalCondensed] = useState(false);

    // Filter reference options (exclude unbuyable/unseeable things if needed, here we'll allow almost everything except MainsNues)
    const catalogueRefOptions = useMemo(() => {
        return refs.filter(r => r.category !== 'Mains_nues');
    }, [refs]);

    const handleAddItem = (refItem: RefEquipement) => {
        const newItem: CatalogueItem = {
            uid: uuidv4(),
            refId: refItem.id,
            quantite: 1,
            rarete: 1,
            is_included: true,
            is_condensed: isGlobalCondensed // S'applique automatiquement
        };
        onItemsChange([...items, newItem]);
    };

    const handleUpdateItem = (uid: string, updates: Partial<CatalogueItem>) => {
        onItemsChange(items.map(item => item.uid === uid ? { ...item, ...updates } : item));
    };

    const handleRemoveItem = (uid: string) => {
        onItemsChange(items.filter(item => item.uid !== uid));
    };

    // Calculate Totals (only for included items)
    const { totalPrix, totalPoids } = useMemo(() => {
        let tprix = 0;
        let tpoids = 0;

        items.forEach(item => {
            if (item.is_included) {
                const refItem = refs.find(r => r.id === item.refId);
                if (refItem) {
                    const prixBase = Number(refItem.prix_info?.prix) || 0;
                    tprix += prixBase * item.rarete * item.quantite;

                    const poidsBase = getItemWeight(refItem);
                    tpoids += poidsBase * item.quantite;
                }
            }
        });

        return { totalPrix: tprix, totalPoids: tpoids };
    }, [items, refs]);

    // Group items by category (e.g. "Armes", "Protections")
    const groupedItems = useMemo(() => {
        const groups: Record<string, CatalogueItem[]> = {};
        items.forEach(item => {
            const refItem = refs.find(r => r.id === item.refId);
            const category = refItem?.category || 'Autre';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        return groups;
    }, [items, refs]);

    // Format utility for prices
    const formatPrice = (amount: number) => {
        if (Number.isInteger(amount)) {
            return amount.toString();
        }
        return amount.toFixed(2);
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-32">
            <div className="bg-parchment/50 p-4 rounded-lg border border-leather/10 shadow-sm relative pt-16">

                {/* Résumé Fixé en Haut */}
                <div className="absolute top-0 left-0 right-0 bg-leather text-parchment p-3 rounded-t-lg shadow-md flex justify-between items-center z-10 w-full mb-4 px-6">
                    <div className="flex items-center gap-2">
                        <GiOpenBook className="text-2xl text-gold" />
                        <h2 className="text-xl font-bold font-heading">Catalogue (Liste d'achats)</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Prix Total</span>
                            <span className="text-xl font-bold text-gold">{formatPrice(totalPrix)}</span>
                        </div>
                        <div className="flex flex-col items-end border-l border-white/20 pl-6">
                            <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Poids Total</span>
                            <span className="text-xl font-bold text-parchment">{formatPrice(totalPoids)}</span>
                        </div>
                    </div>
                </div>

                {/* Contrôles globaux & Ajout */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded border border-leather/20 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-leather-dark select-none shadow-sm bg-parchment px-4 py-2 rounded-md border border-leather/30 hover:bg-white transition-colors">
                        <input
                            type="checkbox"
                            checked={isGlobalCondensed}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setIsGlobalCondensed(checked);
                                // Optional logic: should checking global condensed force update all existing items?
                                // Based on requirements: "permet de masquer les détails de tous les objets d'un coup"
                                onItemsChange(items.map(item => ({ ...item, is_condensed: checked })));
                            }}
                            className="w-5 h-5 rounded border-leather/30 text-bronze focus:ring-bronze"
                        />
                        <GiEyeTarget className="text-xl text-bronze" /> Vue Condensée Globale
                    </label>
                </div>

                <SacItemSelector
                    referenceOptions={catalogueRefOptions}
                    onAddItem={handleAddItem}
                />

                {/* Liste des objets par catégorie */}
                <div className="space-y-8">
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className="text-center p-8 text-leather-light/60 italic border-4 border-dashed border-leather/10 rounded-lg">
                            Votre catalogue est vide. Recherchez un objet ci-dessus pour l'ajouter à votre liste.
                        </div>
                    ) : (
                        Object.entries(groupedItems).map(([category, catItems]) => {
                            const schema = CATEGORY_SCHEMAS[category] || CATEGORY_SCHEMAS['Default'];

                            return (
                                <div key={category} className="space-y-3">
                                    <h3 className="text-lg font-bold text-leather border-b-2 border-bronze/30 pb-1 uppercase tracking-wider pl-2">
                                        {category.replace(/_/g, ' ')}
                                    </h3>

                                    <div className="overflow-x-auto bg-white rounded border border-leather/20 shadow-sm relative">
                                        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                                            <thead className="bg-leather text-parchment uppercase text-[10px]">
                                                <tr>
                                                    <th className="p-2 text-center sticky bg-leather z-40" title="Inclure dans le calcul total" style={{ left: 0, width: 40, minWidth: 40, maxWidth: 40 }}>Inc.</th>
                                                    <th className="p-2 text-center sticky bg-leather z-40" title="Masquer les informations détaillées" style={{ left: 40, width: 40, minWidth: 40, maxWidth: 40 }}>Vue</th>
                                                    <th className="p-2 sticky bg-leather z-40" style={{ left: 80, width: 220, minWidth: 220, maxWidth: 220 }}>Nom</th>
                                                    <th className="p-2 text-center sticky bg-leather z-40" style={{ left: 300, width: 70, minWidth: 70, maxWidth: 70 }}>Qté</th>
                                                    <th className="p-2 text-center sticky bg-leather z-40 border-r border-leather/20 shadow-[2px_0_5px_rgba(0,0,0,0.1)]" style={{ left: 370, width: 80, minWidth: 80, maxWidth: 80 }}>Rareté</th>

                                                    {!isGlobalCondensed && schema.map((field: FieldDef) => {
                                                        if (['prix', 'monnaie', 'poids'].includes(field.key as string)) return null;
                                                        return (
                                                            <th key={field.key as string} className="p-2 border-l border-white/20">
                                                                {field.label}
                                                            </th>
                                                        );
                                                    })}
                                                    <th className="p-2 text-right border-l border-white/20 text-gold sticky bg-leather z-40 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]" style={{ right: 130, width: 100, minWidth: 100, maxWidth: 100 }}>Prix Tot.</th>
                                                    <th className="p-2 text-right sticky bg-leather z-40" style={{ right: 40, width: 90, minWidth: 90, maxWidth: 90 }}>Poids Tot.</th>
                                                    <th className="p-2 text-center sticky bg-leather z-40" style={{ right: 0, width: 40, minWidth: 40, maxWidth: 40 }}></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-leather/10">
                                                {catItems.map(item => {
                                                    const refItem = refs.find(r => r.id === item.refId);
                                                    if (!refItem) return null;

                                                    const prixBase = Number(refItem.prix_info?.prix) || 0;
                                                    const prixTotalItem = prixBase * item.rarete * item.quantite;
                                                    const poidsUnitaire = getItemWeight(refItem);
                                                    const poidsTotalItem = poidsUnitaire * item.quantite;
                                                    const isExcluded = !item.is_included;

                                                    const d = refItem.degats || {};
                                                    const c = refItem.caracteristiques || {};
                                                    const p = refItem.protections || {};
                                                    const pi = refItem.prix_info || {};
                                                    const det = refItem.details || {};
                                                    const craft = refItem.craft || {};

                                                    const flatItem: Record<string, any> = {
                                                        niveau: det.niveau || 0,
                                                        restriction: det.restriction || '',
                                                        origine_rarete: det["origine/rarete"] || det.origine_rarete || '',
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

                                                        degats: d.degats || '',
                                                        pi: d.pi || 0,
                                                    };

                                                    return (
                                                        <tr key={item.uid} className={`hover:bg-leather/5 transition-colors group ${isExcluded ? 'opacity-50 grayscale bg-gray-50' : ''}`}>
                                                            {/* GAUCHE: Contrôles de base et Informations fixes */}
                                                            <td className="p-2 text-center sticky bg-white z-30" style={{ left: 0, width: 40, minWidth: 40, maxWidth: 40 }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.is_included}
                                                                    onChange={(e) => handleUpdateItem(item.uid, { is_included: e.target.checked })}
                                                                    className="w-4 h-4 rounded border-leather text-bronze focus:ring-bronze cursor-pointer"
                                                                    title="Inclure dans le total"
                                                                />
                                                            </td>
                                                            <td className="p-2 text-center sticky bg-white z-30" style={{ left: 40, width: 40, minWidth: 40, maxWidth: 40 }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.is_condensed}
                                                                    onChange={(e) => handleUpdateItem(item.uid, { is_condensed: e.target.checked })}
                                                                    className="w-3.5 h-3.5 rounded border-leather/40 text-gray-500 focus:ring-gray-500 cursor-pointer opacity-70 hover:opacity-100"
                                                                    title="Vue condensée"
                                                                />
                                                            </td>
                                                            <td className="p-2 sticky bg-white z-30" style={{ left: 80, width: 220, minWidth: 220, maxWidth: 220 }}>
                                                                <div className="flex items-center gap-1.5 overflow-hidden w-full">
                                                                    <span className="text-[10px] font-mono bg-leather/10 text-leather-dark px-1 rounded flex-shrink-0">ID: {refItem.ref_id}</span>
                                                                    <span className="font-bold text-leather truncate min-w-0" title={refItem.nom}>{refItem.nom}</span>
                                                                </div>
                                                            </td>

                                                            <td className="p-1 px-2 text-center sticky bg-white z-30" style={{ left: 300, width: 70, minWidth: 70, maxWidth: 70 }}>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantite}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value) || 1;
                                                                        handleUpdateItem(item.uid, { quantite: Math.max(1, val) });
                                                                    }}
                                                                    className="w-full max-w-[50px] text-center bg-parchment/50 border border-leather/20 rounded focus:ring-bronze text-leather font-bold p-1 text-xs mx-auto"
                                                                />
                                                            </td>

                                                            <td className="p-1 text-center sticky bg-white z-30 border-r border-leather/10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]" style={{ left: 370, width: 80, minWidth: 80, maxWidth: 80 }}>
                                                                <select
                                                                    value={item.rarete}
                                                                    onChange={(e) => handleUpdateItem(item.uid, { rarete: Number(e.target.value) })}
                                                                    className="w-full max-w-[65px] text-xs border border-leather/20 rounded bg-parchment/50 text-leather focus:ring-bronze p-0.5 mx-auto text-center"
                                                                >
                                                                    <option value={0.5}>x0.5</option>
                                                                    <option value={1}>x1</option>
                                                                    <option value={1.5}>x1.5</option>
                                                                    <option value={2}>x2</option>
                                                                </select>
                                                            </td>

                                                            {/* CENTRE: Schéma Détaillé */}
                                                            {!isGlobalCondensed && schema.map((field: FieldDef) => {
                                                                if (['prix', 'monnaie', 'poids'].includes(field.key as string)) return null;

                                                                if (item.is_condensed) {
                                                                    return <td key={field.key as string} className="p-2 border-l border-leather/10 bg-gray-50/50 text-center border-b border-leather/5"><span className="opacity-20">-</span></td>;
                                                                }

                                                                let val = flatItem[field.key as string];
                                                                if (val === undefined || val === null || val === 0 || val === '0') val = '-';

                                                                const isTextarea = field.type === 'textarea';

                                                                return (
                                                                    <td key={field.key as string} className={`p-2 border-l border-leather/10 ${isTextarea ? 'max-w-[200px] truncate' : 'text-center'} text-sm text-leather border-b border-leather/5`} title={isTextarea ? String(val) : ''}>
                                                                        <span className={`${field.key === 'degats' && val !== '-' ? 'text-red-700 font-bold' : ''} ${field.key.toString().startsWith('pr_') && val !== '-' ? 'text-blue-700 font-bold' : ''} ${isTextarea && val !== '-' ? 'italic text-xs font-normal opacity-80' : ''} ${val === '-' ? 'opacity-30' : ''}`}>
                                                                            {val}
                                                                        </span>
                                                                    </td>
                                                                );
                                                            })}

                                                            {/* DROITE: Totaux */}
                                                            <td className="p-2 text-right border-l border-leather/10 bg-parchment sticky z-30 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]" style={{ right: 130, width: 100, minWidth: 100, maxWidth: 100 }}>
                                                                <span className="font-bold text-gold overflow-hidden text-ellipsis whitespace-nowrap block w-full" title={`${formatPrice(prixTotalItem)} ${refItem.prix_info?.monnaie || ''}`}>
                                                                    {formatPrice(prixTotalItem)} {refItem.prix_info?.monnaie || ''}
                                                                </span>
                                                            </td>

                                                            <td className="p-2 text-right sticky bg-white z-30" style={{ right: 40, width: 90, minWidth: 90, maxWidth: 90 }}>
                                                                <span className="font-bold text-leather overflow-hidden text-ellipsis whitespace-nowrap block w-full" title={`${formatPrice(poidsTotalItem)}`}>
                                                                    {formatPrice(poidsTotalItem)}
                                                                </span>
                                                            </td>

                                                            <td className="p-2 text-center sticky bg-white z-30 text-xl font-bold" style={{ right: 0, width: 40, minWidth: 40, maxWidth: 40 }}>
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.uid)}
                                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                                    title="Retirer du catalogue"
                                                                >
                                                                    <GiTrashCan className="text-lg" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
