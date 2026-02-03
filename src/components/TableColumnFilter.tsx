import React, { useState, useRef, useEffect } from 'react';

interface TableColumnFilterProps {
    columnKey: string;
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}

export const TableColumnFilter: React.FC<TableColumnFilterProps> = ({
    columnKey,
    label,
    options,
    selectedValues,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync temp state when opening
    useEffect(() => {
        if (isOpen) {
            setTempSelected(selectedValues);
        }
    }, [isOpen, selectedValues]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        setTempSelected(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const handleSelectAll = () => {
        if (tempSelected.length === options.length) {
            setTempSelected([]);
        } else {
            setTempSelected([...options]);
        }
    };

    const applyFilter = () => {
        onChange(tempSelected);
        setIsOpen(false);
    };

    const cancelFilter = () => {
        setIsOpen(false);
    };

    const isFiltered = selectedValues.length > 0;

    return (
        <div className="relative inline-block ml-2" ref={containerRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`p-1 rounded hover:bg-white/30 transition-colors ${isFiltered ? 'text-blue-700 font-bold bg-white/40' : 'text-leather-light opacity-50'}`}
                title={isFiltered ? `Filtres actifs: ${selectedValues.join(', ')}` : "Filtrer"}
            >
                🌪️
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 min-w-[250px] max-h-[400px] flex flex-col bg-parchment border-2 border-leather rounded shadow-xl mt-1 text-left">
                    <div className="p-2 border-b border-leather/20 bg-white/40 backdrop-blur-md rounded-t flex-shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold font-serif text-black uppercase">{label}</span>
                            <span className="text-[10px] text-gray-700 font-bold">{tempSelected.length} / {options.length}</span>
                        </div>
                        <button
                            onClick={handleSelectAll}
                            className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline w-full text-left"
                        >
                            {tempSelected.length === options.length ? 'Tout décocher' : 'Tout sélectionner'}
                        </button>
                    </div>

                    <div className="p-1 bg-white/30 overflow-y-auto flex-1 max-h-[250px]">
                        {options.length === 0 ? (
                            <div className="p-2 text-xs text-gray-600 italic">Aucune valeur disponible</div>
                        ) : (
                            options.map(option => (
                                <label key={option} className="flex items-center px-2 py-1 hover:bg-black/10 rounded cursor-pointer text-sm text-black font-medium">
                                    <input
                                        type="checkbox"
                                        checked={tempSelected.includes(option)}
                                        onChange={() => toggleOption(option)}
                                        className="mr-2 accent-leather cursor-pointer"
                                    />
                                    <span className="truncate">{option === '' ? ' (Vide) ' : option}</span>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t border-leather/20 bg-white/40 backdrop-blur-md rounded-b flex justify-between gap-2 flex-shrink-0">
                        <button
                            onClick={cancelFilter}
                            className="flex-1 px-2 py-1 text-xs font-bold text-leather border border-leather/30 rounded hover:bg-white/50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={applyFilter}
                            className="flex-1 px-2 py-1 text-xs font-bold text-parchment bg-leather rounded hover:bg-leather-dark shadow-sm"
                        >
                            Valider
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
