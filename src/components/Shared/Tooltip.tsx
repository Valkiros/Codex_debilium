import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    visible: boolean;
    position: { x: number, y: number };
    title?: string;
    children?: React.ReactNode;
    requireCtrl?: boolean;
    direction?: 'top' | 'bottom' | 'auto';
}

export const Tooltip: React.FC<TooltipProps> = ({ visible, position, title, children, requireCtrl = true, direction = 'auto' }) => {
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

    if (!visible) return null;
    if (requireCtrl && !isCtrlPressed) return null;

    // Smart Positioning Logic
    let effectiveDirection = direction;
    if (direction === 'auto') {
        // If in lower 40% of screen, go top. Else go bottom (default reading direction usually down)
        // Adjust threshold as needed. 
        effectiveDirection = (position.y > window.innerHeight * 0.6) ? 'top' : 'bottom';
    }

    const verticalClass = effectiveDirection === 'top' ? '-translate-y-full' : 'translate-y-0';
    const topStyle = effectiveDirection === 'top' ? position.y - 10 : position.y + 10;



    return createPortal(
        <div
            className={`fixed z-[9999] p-4 bg-tooltip-bg text-tooltip-text rounded-lg shadow-xl border-2 border-tooltip-border w-96 pointer-events-none transform -translate-x-1/2 ${verticalClass}`}
            style={{ left: position.x, top: topStyle }}
        >
            {title && (
                <div className="font-serif font-bold text-xl mb-2 border-b border-tooltip-border/40 pb-1 text-tooltip-title tracking-wide">
                    {title}
                </div>
            )}

            <div className="text-sm space-y-1.5 opacity-90 font-sans">
                {children}
            </div>
        </div>,
        document.body
    );
};
