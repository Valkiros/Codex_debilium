import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscChromeRestore } from "react-icons/vsc";

interface TitleBarProps {
    onCheckUpdate: () => void;
    onOpenInfo: () => void;
}

export function TitleBar({ onCheckUpdate, onOpenInfo }: TitleBarProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // Initialize window state
    useEffect(() => {
        const updateState = async () => {
            const win = getCurrentWindow();
            setIsMaximized(await win.isMaximized());
        };
        updateState();

        // Ideally we'd listen for resize events, but for now we'll update on click
        const handleResize = async () => {
            const win = getCurrentWindow();
            setIsMaximized(await win.isMaximized());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMinimize = async () => await getCurrentWindow().minimize();

    const handleMaximize = async () => {
        const win = getCurrentWindow();
        const max = await win.isMaximized();
        if (max) {
            await win.unmaximize();
            setIsMaximized(false);
        } else {
            await win.maximize();
            setIsMaximized(true);
        }
    };

    const handleClose = async () => await getCurrentWindow().close();

    return (
        <div className="h-8 bg-black flex items-center justify-between select-none absolute top-0 left-0 right-0 z-[100] text-[#cccccc] font-sans text-sm border-b border-[#333]">
            {/* Left Section: Icon + Help */}
            <div className="flex items-center h-full z-20">
                {/* App Icon */}
                <div className="pl-3 pr-2 h-full flex items-center justify-center pointer-events-none">
                    <img src="/favicon.ico" alt="Icon" className="w-4 h-4" />
                </div>

                {/* Help Menu */}
                <div className="relative h-full flex items-center">
                    <button
                        onClick={() => setIsHelpOpen(!isHelpOpen)}
                        className={`px-3 h-full hover:bg-[#333] flex items-center focus:outline-none transition-colors ${isHelpOpen ? 'bg-[#333]' : ''}`}
                    >
                        Aide
                    </button>

                    {isHelpOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsHelpOpen(false)}></div>
                            <div className="absolute top-full left-0 w-56 bg-[#1f1f1f] border border-[#333] text-[#cccccc] shadow-2xl z-50 flex flex-col py-1">
                                <button
                                    onClick={() => { onCheckUpdate(); setIsHelpOpen(false); }}
                                    className="px-4 py-2 hover:bg-[#333] text-left flex items-center gap-3 w-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                    Vérifier mise à jour
                                </button>
                                <button
                                    onClick={() => { onOpenInfo(); setIsHelpOpen(false); }}
                                    className="px-4 py-2 hover:bg-[#333] text-left flex items-center gap-3 w-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                    </svg>
                                    Informations
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Center Section: Drag Region */}
            <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-center text-xs text-[#999] cursor-default">
                Codex debilium
            </div>

            {/* Right Section: Window Controls */}
            <div className="flex items-center h-full z-20">
                <button onClick={handleMinimize} className="h-full w-12 flex items-center justify-center hover:bg-[#333] transition-colors" title="Réduire">
                    <VscChromeMinimize />
                </button>
                <button onClick={handleMaximize} className="h-full w-12 flex items-center justify-center hover:bg-[#333] transition-colors" title={isMaximized ? "Niveau inférieur" : "Agrandir"}>
                    {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
                </button>
                <button onClick={handleClose} className="h-full w-12 flex items-center justify-center hover:bg-[#e81123] hover:text-white transition-colors" title="Fermer">
                    <VscChromeClose />
                </button>
            </div>

        </div>
    );
}
