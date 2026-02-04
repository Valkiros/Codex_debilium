import React from 'react';
import { StatDetail } from '../types';

interface CalculationDetailsProps {
    details: StatDetail | { value: number; components: { label: string; value: number }[] };
}

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({ details }) => {
    // Adapter to handle both StatDetail (with formula + total) and DetailedValue (value + components)
    // DetailedValue (CharacteristicsPanel) doesn't have 'formula' or 'total' explicit properties in the same way,
    // but 'value' is the total.

    // Normalize data
    const components = details.components;

    // Check if it's StatDetail type (has 'total' property)
    const total = 'total' in details ? details.total : (details as any).value;
    const formula = 'formula' in details ? details.formula : undefined;

    return (
        <div className="flex flex-col gap-1 text-xs min-w-[150px]">
            {formula && (
                <div className="mb-1 text-tooltip-label/80 text-xs italic border-b border-tooltip-border/30 pb-1 text-center font-serif">
                    {formula}
                </div>
            )}

            {components.map((comp, i) => (
                <div key={i} className="flex justify-between items-center">
                    <span className="text-tooltip-label font-medium">{comp.label}</span>
                    <span className={`font-bold ml-4 ${comp.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comp.value > 0 ? '+' : ''}{comp.value}
                    </span>
                </div>
            ))}

            <div className="border-t border-tooltip-border/50 mt-1 pt-1 flex justify-between font-bold text-sm bg-tooltip-border/10 p-1 rounded">
                <span className="text-tooltip-title">Total</span>
                <span className="text-tooltip-text">{total}</span>
            </div>
        </div>
    );
};
