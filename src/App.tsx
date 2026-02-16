import { useEffect, useRef, useState } from "react";
import "./index.css";
import { supabase } from "./lib/supabase";
import Login from "./components/Accueil/Login";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";

import { CharacterSheet, CharacterSheetHandle } from "./components/Personnage/Fiche/CharacterSheet";
import { CharacterSelection } from "./components/Accueil/CharacterSelection";
import { ConfirmModal } from "./components/Shared/ConfirmModal";
import { UserProfile } from "./types";

import { AdminPanel } from "./components/Admin/AdminPanel";

// ... (existing imports)

import { ThemeProvider } from "./context/ThemeContext";
import { ThemeSelector } from "./components/Shared/ThemeSelector";
import { ErrorBoundary } from "./components/Shared/ErrorBoundary";
import { DatabaseUpdate } from "./components/Shared/DatabaseUpdate";

import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { UpdateModal, UpdateStatus } from "./components/Shared/UpdateModal";

// ... (dans AppContent, après les autres useEffect)


function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [view, setView] = useState<'selection' | 'sheet' | 'admin'>('selection');
  const [isDirty, setIsDirty] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  /* -------------------------------------------------------------
   *  Données de mise à jour (Modal personnalisée)
   * ------------------------------------------------------------- */
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const checkForUpdates = async (manual = false) => {
    if (manual) {
      setUpdateStatus('checking');
    }

    try {
      const update = await check();

      if (update && update.available) {
        setUpdateInfo(update);
        setUpdateStatus('available');
      } else if (manual) {
        setUpdateStatus('uptodate');
      }
    } catch (error: any) {
      console.error("Failed to check for updates:", error);
      // On ne montre l'erreur que si c'est une demande manuelle
      if (manual) {
        setUpdateError(String(error));
        setUpdateStatus('error');
      }
    }
  };

  const handleInstallUpdate = async () => {
    if (!updateInfo) return;
    try {
      setUpdateStatus('downloading');
      await updateInfo.downloadAndInstall();
      await relaunch();
    } catch (e) {
      console.error("Install failed", e);
      setUpdateError("Échec de l'installation : " + String(e));
      setUpdateStatus('error');
    }
  };

  const closeUpdateModal = () => {
    setUpdateStatus('idle');
    setUpdateError(null);
  };


  useEffect(() => {
    checkForUpdates(false); // Auto-check on startup
  }, []);

  // Close menu when changing view
  useEffect(() => {
    setIsMenuOpen(false);
  }, [view, selectedCharacterId]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const sheetRef = useRef<CharacterSheetHandle>(null);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      // Fetch user profile from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setUserProfile(data as UserProfile);
      } else if (error) {
        console.error("Error fetching profile:", error);
      }
    };

    // Listens to auth changes (fires immediately with current session too)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (session) {
        // Only fetch if profile is missing or ID changed to avoid loops
        // Simple check for now: always fetch on auth change is safer than stale data
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });


    // Window close warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // Update view when character is selected/deselected
  useEffect(() => {
    if (selectedCharacterId) {
      setView('sheet');
    } else if (view !== 'admin') {
      setView('selection');
    }
  }, [selectedCharacterId]);

  const runWithCheck = (action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
      setShowConfirm(true);
    } else {
      action();
    }
  };

  const handleLogout = async () => {
    runWithCheck(async () => {
      await supabase.auth.signOut();
      setSelectedCharacterId(null);
      setView('selection');
      setIsDirty(false);
    });
  };

  const handleChangeCharacter = () => {
    runWithCheck(() => {
      setSelectedCharacterId(null);
      setView('selection');
      setIsDirty(false);
    });
  };

  const handleAdminView = () => {
    runWithCheck(() => {
      setSelectedCharacterId(null);
      setView('admin');
      setIsDirty(false);
    });
  };

  // Render Logic based on View
  let content;
  if (view === 'admin') {
    content = <AdminPanel onBack={handleChangeCharacter} />;
  } else if (selectedCharacterId) {
    content = (
      <ErrorBoundary>
        <CharacterSheet
          ref={sheetRef}
          characterId={selectedCharacterId}
          onDirtyChange={setIsDirty}
        />
      </ErrorBoundary>
    );
  } else {
    content = (
      <CharacterSelection
        onSelect={(id) => { setSelectedCharacterId(id); }}
        isAuthenticated={!!session}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-parchment text-leather font-sans overflow-hidden overscroll-none relative">
      <header className="p-4 bg-leather text-parchment shadow-md flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Codex debilium</h1>
          {userProfile && (
            <span className="px-2 py-1 bg-parchment text-leather text-xs font-bold rounded uppercase border border-leather/50">
              {userProfile.role}
            </span>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-parchment hover:bg-white/10 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Navigation Actions */}
        <div className={`
          ${isMenuOpen ? 'flex' : 'hidden'} 
          md:flex flex-col md:flex-row 
          absolute md:static top-full left-0 w-full md:w-auto 
          bg-leather md:bg-transparent 
          p-4 md:p-0 
          gap-4 items-stretch md:items-center 
          shadow-lg md:shadow-none 
          z-50
        `}>
          <div id="header-actions" className="flex justify-center md:justify-start"></div>

          <div className="flex justify-center md:justify-start">
            <ThemeSelector />
          </div>

          {session && userProfile?.role === 'admin' && view !== 'admin' && (
            <button
              onClick={handleAdminView}
              className="px-3 py-1 bg-[#cca43b] text-leather-dark font-bold rounded text-sm hover:bg-[#eebb44] cursor-pointer text-center"
            >
              Base de Données (Admin)
            </button>
          )}

          {view === 'sheet' && (
            <button
              onClick={handleChangeCharacter}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer"
            >
              Changer de personnage
            </button>
          )}

          {view === 'admin' && (
            <button
              onClick={handleChangeCharacter}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer"
            >
              Retour Accueil
            </button>
          )}

          {session ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer"
            >
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer font-bold"
            >
              Connexion
            </button>
          )}

          {/* Update Button */}
          <button
            onClick={() => checkForUpdates(true)}
            className="px-3 py-1 bg-leather-light text-parchment rounded text-sm hover:bg-leather-lighter cursor-pointer border border-parchment/20"
            title="Vérifier les mises à jour"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

        </div>
      </header>
      <main className="flex-1 overflow-auto bg-parchment-pattern">
        {content}
      </main>

      {/* Login Modal */}
      {isLoginOpen && !session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Login onClose={() => setIsLoginOpen(false)} />
        </div>
      )}


      <ConfirmModal
        isOpen={showConfirm}
        title="Modifications non sauvegardées"
        message="Vous avez des modifications non enregistrées. Que voulez-vous faire ?"
        onSaveAndContinue={async () => {
          if (sheetRef.current) {
            await sheetRef.current.save();
            pendingAction?.();
            setShowConfirm(false);
          }
        }}
        onConfirm={() => {
          pendingAction?.();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Quitter sans sauvegarder"
        saveLabel="Sauvegarder et Quitter"
      />

      <UpdateModal
        status={updateStatus}
        updateInfo={updateInfo}
        errorMsg={updateError}
        onClose={closeUpdateModal}
        onInstall={handleInstallUpdate}
      />

      <DatabaseUpdate />
    </div>
  );
}

import { RefProvider } from "./context/RefContext";

function App() {
  return (
    <ThemeProvider>
      <RefProvider>
        <AppContent />
      </RefProvider>
    </ThemeProvider>
  );
}

export default App;
