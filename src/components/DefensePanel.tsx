import React, { useState } from 'react';
import { Defenses, Movement, ProtectionValue, MagicStealth, StatDetail } from '../types';
import { Tooltip } from './Tooltip';

interface DefensePanelProps {
    defenses: Defenses;
    movement: Movement;
    magic: MagicStealth;
    computedDefenses?: {
        solide: { value: number, details: StatDetail },
        speciale: { value: number, details: StatDetail },
        magique: { value: number, details: StatDetail }
    };
    computedMovement?: {
        marche: { value: number, details: StatDetail },
        course: { value: number, details: StatDetail }
    };
    computedDiscretion?: { value: number, details: StatDetail };
    onDefenseChange: (defenses: Defenses) => void;
    onMovementChange: (movement: Movement) => void;
    onMagicChange: (magic: MagicStealth) => void;
}

export const DefensePanel: React.FC<DefensePanelProps> = ({ defenses, movement, magic, computedDefenses, computedMovement, computedDiscretion, onDefenseChange, onMovementChange, onMagicChange }) => {
    const [hoveredInfo, setHoveredInfo] = useState<{ details: StatDetail, x: number, y: number } | null>(null);

    const handleProtectionChange = (category: keyof Defenses, field: keyof ProtectionValue, value: string) => {
        const num = parseInt(value) || 0;
        // @ts-ignore - Dynamic access to Defenses properties
        const currentProt = defenses[category] as ProtectionValue;
        onDefenseChange({
            ...defenses,
            [category]: { ...currentProt, [field]: num }
        });
    };

    const handleMovementChange = (category: keyof Movement, field: keyof ProtectionValue, value: string) => {
        const num = parseInt(value) || 0;
        onMovementChange({
            ...movement,
            [category]: { ...movement[category], [field]: num }
        });
    };

    const handleMagicChange = (category: keyof MagicStealth, field: keyof ProtectionValue, value: string) => {
        const num = parseInt(value) || 0;
        onMagicChange({
            ...magic,
            [category]: { ...magic[category], [field]: num }
        });
    };

    const handleShieldToggle = () => {
        onDefenseChange({ ...defenses, bouclier_actif: !defenses.bouclier_actif });
    };

    // Calculate effective total using computed base if available, else state base
    const getEffectiveBase = (category: keyof Defenses) => {
        if (!computedDefenses) return (defenses[category] as ProtectionValue).base;

        if (category === 'solide') return computedDefenses.solide.value;
        if (category === 'speciale') return computedDefenses.speciale.value;
        if (category === 'magique') return computedDefenses.magique.value;
        return (defenses[category] as ProtectionValue).base;
    };

    const calculateTotalProtection = () => {
        const nat = defenses.naturelle.base + defenses.naturelle.temp;
        // For others, use effective base which comes from inventory
        const sol = getEffectiveBase('solide') + defenses.solide.temp;
        const spe = getEffectiveBase('speciale') + defenses.speciale.temp;
        const mag = getEffectiveBase('magique') + defenses.magique.temp;

        return nat + sol + spe + mag;
    };

    const renderProtectionRow = (label: string, category: keyof Defenses) => {
        // @ts-ignore
        const data = defenses[category] as ProtectionValue;

        // Determine if this row is auto-calculated
        let isComputed = false;
        let baseValue = data.base;
        let details: StatDetail | undefined;

        if (computedDefenses) {
            if (category === 'solide') { baseValue = computedDefenses.solide.value; details = computedDefenses.solide.details; isComputed = true; }
            if (category === 'speciale') { baseValue = computedDefenses.speciale.value; details = computedDefenses.speciale.details; isComputed = true; }
            if (category === 'magique') { baseValue = computedDefenses.magique.value; details = computedDefenses.magique.details; isComputed = true; }
        }

        return (
            <div className="flex items-center gap-2 mb-2">
                <label className="w-24 text-sm font-bold text-leather">{label}</label>
                <input
                    type="number"
                    value={isComputed ? baseValue : (data.base || '')}
                    onChange={(e) => !isComputed && handleProtectionChange(category, 'base', e.target.value)}
                    readOnly={isComputed}
                    className={`w-16 border border-leather/30 rounded text-center ${isComputed ? 'bg-black/5 text-leather-dark cursor-help font-bold' : 'bg-white/50'}`}
                    placeholder="Base"
                    onMouseEnter={(e) => {
                        if (isComputed && details) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredInfo({
                                details,
                                x: rect.left + (rect.width / 2),
                                y: rect.top
                            });
                        }
                    }}
                    onMouseLeave={() => setHoveredInfo(null)}
                />
                <span className="text-leather-light">+</span>
                <input
                    type="number"
                    value={data.temp || ''}
                    onChange={(e) => handleProtectionChange(category, 'temp', e.target.value)}
                    className="w-16 bg-white/50 border border-leather/30 rounded text-center"
                    placeholder="Temp"
                />
                <span className="text-leather-light">=</span>
                <span className="w-8 font-bold text-center">{baseValue + (data.temp || 0)}</span>
            </div>
        );
    };

    const renderMovementRow = (label: string, category: keyof Movement) => {
        const data = movement[category];

        let isComputed = false;
        let baseValue = data.base;
        let details: StatDetail | undefined;

        if (computedMovement) {
            if (category === 'marche') { baseValue = computedMovement.marche.value; details = computedMovement.marche.details; isComputed = true; }
            if (category === 'course') { baseValue = computedMovement.course.value; details = computedMovement.course.details; isComputed = true; }
        }

        return (
            <div className="flex items-center gap-2 mb-2">
                <label className="w-24 text-sm font-bold text-leather">{label}</label>
                <input
                    type="number"
                    value={isComputed ? baseValue : (data.base || '')}
                    onChange={(e) => !isComputed && handleMovementChange(category, 'base', e.target.value)}
                    readOnly={isComputed}
                    className={`w-16 border border-leather/30 rounded text-center ${isComputed ? 'bg-black/5 text-leather-dark cursor-help font-bold' : 'bg-white/50'}`}
                    placeholder="Base"
                    onMouseEnter={(e) => {
                        if (isComputed && details) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredInfo({
                                details,
                                x: rect.left + (rect.width / 2),
                                y: rect.top
                            });
                        }
                    }}
                    onMouseLeave={() => setHoveredInfo(null)}
                />
                <span className="text-leather-light">+</span>
                <input
                    type="number"
                    value={data.temp || ''}
                    onChange={(e) => handleMovementChange(category, 'temp', e.target.value)}
                    className="w-16 bg-white/50 border border-leather/30 rounded text-center"
                    placeholder="Add"
                />
                <span className="text-leather-light">=</span>
                <span className="w-8 font-bold text-center">{baseValue + (data.temp || 0)}</span>
            </div>
        );
    };

    const renderDiscretionRow = (label: string) => {
        const data = magic.discretion;
        const isComputed = computedDiscretion !== undefined;
        const baseValue = isComputed ? computedDiscretion.value : data.base;
        const details = isComputed ? computedDiscretion.details : undefined;

        return (
            <div className="flex items-center gap-2 mb-2">
                <label className="w-24 text-sm font-bold text-leather">{label}</label>
                <input
                    type="number"
                    value={isComputed ? baseValue : (data.base || '')}
                    onChange={(e) => !isComputed && handleMagicChange('discretion', 'base', e.target.value)}
                    readOnly={isComputed}
                    className={`w-16 border border-leather/30 rounded text-center ${isComputed ? 'bg-black/5 text-leather-dark cursor-help font-bold' : 'bg-white/50'}`}
                    placeholder="Base"
                    onMouseEnter={(e) => {
                        if (isComputed && details) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredInfo({
                                details,
                                x: rect.left + (rect.width / 2),
                                y: rect.top
                            });
                        }
                    }}
                    onMouseLeave={() => setHoveredInfo(null)}
                />
                <span className="text-leather-light">+</span>
                <input
                    type="number"
                    value={data.temp || ''}
                    onChange={(e) => handleMagicChange('discretion', 'temp', e.target.value)}
                    className="w-16 bg-white/50 border border-leather/30 rounded text-center"
                    placeholder="Add"
                />
                <span className="text-leather-light">=</span>
                <span className="w-8 font-bold text-center">{(baseValue || 0) + (data.temp || 0)}</span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            {/* Protections */}
            <div className="p-4 bg-parchment/30 rounded border border-leather/20">
                <h3 className="font-serif font-bold text-leather font-xl uppercase mb-4 border-b border-leather/20 pb-2 flex justify-between">
                    Protections
                    <span className="text-sm normal-case opacity-75">Total: <strong className="text-lg">{calculateTotalProtection()}</strong></span>
                </h3>

                {renderProtectionRow("Naturelle", "naturelle")}
                {renderProtectionRow("Solide", "solide")}
                {renderProtectionRow("Spéciale", "speciale")}
                {renderProtectionRow("Magique", "magique")}

                <div className="mt-4 flex items-center justify-between bg-leather/10 p-2 rounded">
                    <span className="font-bold text-leather">Bouclier Actif</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={defenses.bouclier_actif}
                            onChange={handleShieldToggle}
                        />
                        <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leather"></div>
                    </label>
                </div>
            </div>

            {/* Movement & Discretion */}
            <div className="p-4 bg-parchment/30 rounded border border-leather/20 h-min">
                <h3 className="font-serif font-bold text-leather font-xl uppercase mb-4 border-b border-leather/20 pb-2">
                    Mouvement & Discrétion
                </h3>
                {renderMovementRow("Marche", "marche")}
                {renderMovementRow("Course", "course")}
                <div className="my-2 border-t border-leather/10"></div>
                {renderDiscretionRow("Discrétion")}
            </div>

            <Tooltip visible={!!hoveredInfo} position={hoveredInfo ? { x: hoveredInfo.x, y: hoveredInfo.y } : { x: 0, y: 0 }} title="Détails du Calcul">
                {hoveredInfo && (
                    <>
                        <div className="mb-2 text-[#cca43b] text-xs italic border-b border-[#cca43b]/20 pb-1">
                            {hoveredInfo.details.formula}
                        </div>
                        <div className="space-y-1">
                            {hoveredInfo.details.components.map((comp, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="whitespace-pre-wrap">{comp.label} :</span>
                                    <span className={`font-bold ${comp.value >= 0 ? 'text-[#eebb44]' : 'text-red-400'}`}>
                                        {comp.value > 0 ? '+' : ''}{comp.value}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-[#cca43b]/20 mt-2 pt-1 flex justify-between items-center font-bold text-[#eebb44]">
                                <span>Total :</span>
                                <span>{hoveredInfo.details.total}</span>
                            </div>
                        </div>
                    </>
                )}
            </Tooltip>
        </div>
    );
};
