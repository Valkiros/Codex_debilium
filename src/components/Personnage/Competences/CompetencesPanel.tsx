
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Competence, CharacterCompetence } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip } from '../../Shared/Tooltip';
import { SearchableSelect } from '../../Shared/SearchableSelect';

interface CompetencesPanelProps {
    title: string;
    competences: CharacterCompetence[];
    onCompetencesChange: (competences: CharacterCompetence[]) => void;
}

export const CompetencesPanel: React.FC<CompetencesPanelProps> = ({ title, competences, onCompetencesChange }) => {
    const [referenceCompetences, setReferenceCompetences] = useState<Competence[]>([]);


    // Tooltip State
    const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control') setIsCtrlPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control') setIsCtrlPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleMouseEnter = (id: string, e: React.MouseEvent) => {
        setHoveredCompId(id);
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredCompId(null);
    };

    useEffect(() => {
        const fetchRefCompetences = async () => {
            try {
                const data = await invoke('get_competences') as Competence[];
                setReferenceCompetences(data);
            } catch (err) {
                console.error("Failed to fetch reference competences:", err);
            }
        };
        fetchRefCompetences();
    }, []);

    const handleAddRow = () => {
        const newCompetence: CharacterCompetence = {
            id: uuidv4(),
            nom: '',
            description: ''
        };
        onCompetencesChange([...competences, newCompetence]);
    };

    const handleRemoveRow = (id: string) => {
        onCompetencesChange(competences.filter(c => c.id !== id));
    };

    const handleSelectChange = (id: string, competenceName: string) => {
        // Since SearchableSelect returns the ID/Value string, we use that.
        // But here we are using the name as the ID in the select options for simplicity, 
        // effectively linking by name.
        const refComp = referenceCompetences.find(c => c.nom === competenceName);

        if (refComp) {
            onCompetencesChange(competences.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        nom: refComp.nom,
                        description: refComp.description,
                        tableau: refComp.tableau
                    };
                }
                return c;
            }));
        } else {
            // Handle clear or custom input if needed.
            // For now, if cleared, just clear the fields.
            if (competenceName === '') {
                onCompetencesChange(competences.map(c => {
                    if (c.id === id) {
                        return { ...c, nom: '', description: '', tableau: undefined };
                    }
                    return c;
                }));
            }
        }
    };






    const activeTooltipComp = hoveredCompId ? competences.find(c => c.id === hoveredCompId) : null;

    return (
        <div className="mb-6 p-6 bg-parchment/30 rounded-lg shadow-sm border border-leather/20 relative">
            {activeTooltipComp && activeTooltipComp.tableau && (
                <Tooltip
                    visible={!!hoveredCompId}
                    position={mousePos}
                    title="Tableau"
                    requireCtrl={true}
                    direction="auto"
                >
                    <div className="flex flex-col gap-1 text-sm">
                        {Array.isArray(activeTooltipComp.tableau) ? (
                            activeTooltipComp.tableau.map((line: string, idx: number) => (
                                <div key={idx} className="text-tooltip-text whitespace-pre-wrap">{line}</div>
                            ))
                        ) : (
                            <div className="text-tooltip-text whitespace-pre-wrap">{String(activeTooltipComp.tableau)}</div>
                        )}
                    </div>
                </Tooltip>
            )}

            <div className="flex justify-between items-center mb-4 border-b border-leather/30 pb-2">
                <h3 className="text-xl font-bold text-leather-dark font-serif tracking-wide">{title}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddRow}
                        className="px-3 py-1 bg-leather text-parchment font-serif font-bold rounded hover:bg-leather-dark active:scale-95 transition-all shadow-sm"
                        title="Ajouter une ligne"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-leather rounded bg-parchment-light">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-leather text-parchment">
                            <th className="p-3 border-b border-leather w-1/3">Compétence</th>
                            <th className="p-3 border-b border-leather">Description</th>
                            <th className="p-3 border-b border-leather w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {competences.map((comp) => (
                            <tr key={comp.id} className="even:bg-parchment hover:bg-parchment-dark transition-colors border-b border-leather/20 last:border-0">
                                <td
                                    className="p-3 align-top"
                                    onMouseEnter={(e) => handleMouseEnter(comp.id, e)}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <SearchableSelect
                                        options={referenceCompetences.map(r => ({ id: r.nom, label: r.nom }))}
                                        value={comp.nom}
                                        onChange={(val) => handleSelectChange(comp.id, val)}
                                        className="w-full"
                                        placeholder="Choisir une compétence..."
                                    />
                                </td>
                                <td className="p-3 align-top text-sm text-leather-dark">
                                    {comp.description}
                                </td>
                                <td className="p-3 align-top text-center">
                                    <button
                                        onClick={() => handleRemoveRow(comp.id)}
                                        className="text-red-600 hover:text-red-800 font-bold"
                                        title="Supprimer cette ligne"
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {competences.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center italic text-leather/70">
                                    Aucune compétence ajoutée. Cliquez sur + pour commencer.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-right text-sm text-leather/60 mt-2">
                Total: {competences.length} compétences
            </div>
        </div>
    );
};
