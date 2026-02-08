import { CharacterCompetence, CharacterData } from "../types";

/**
 * Applies dynamic rules to the character's competencies.
 * This function is intended to be called whenever competencies change.
 * It handles automatic addition/removal of bonus skills based on specific rules
 * (e.g., "Les yeux révolver" granting "Terrifiant I" or "Terrifiant II").
 *
 * @param newCompetences The updated list of competencies (after user action).
 * @param data The full character data (needed for Origin/Job/Identity checks).
 * @param gameRules The loaded game rules (needed for checking Native skills).
 * @param referenceCompetences The full list of available competencies (for descriptions).
 * @returns The modified list of competencies with rules applied.
 */
export const applyCompetenceRules = (
    newCompetences: CharacterCompetence[],
    data: CharacterData,
    gameRules: any,
    referenceCompetences: any[]
): CharacterCompetence[] => {

    // Safety check
    if (!gameRules || !data.identity) {
        return newCompetences;
    }

    // --- RULE: "Les yeux révolver" ---
    // Grants "Terrifiant I" (if none) or "Terrifiant II" (if T1 exists).
    // Tagging: System-added skills have source: 'les_yeux'.

    const hasYeux = newCompetences.some(c => c.nom === 'Les yeux révolver' || c.nom === 'Les yeux révolvers');

    if (hasYeux) {
        let hasBaseT1 = false;

        // 1. Check Native (Origin)
        if (data.identity.origine) {
            const origin = gameRules.origines.find((o: any) => o.name_m === data.identity.origine || o.name_f === data.identity.origine);
            if (origin) {
                const comps = origin.competences || (origin as any).Competences || [];
                if (comps.includes('Terrifiant I')) hasBaseT1 = true;
            }
        }

        // 2. Check Job (Mandatory)
        if (!hasBaseT1 && data.identity.metier) {
            const job = gameRules.metiers.find((m: any) => m.name_m === data.identity.metier || m.name_f === data.identity.metier);
            if (job) {
                const mandatory = job.competences_obligatoires || (job as any).Competences_obligatoires || [];
                if (mandatory.includes('Terrifiant I')) hasBaseT1 = true;
            }
        }

        // 3. Check Manual/Item (Non-System T1)
        // We look for T1 that does NOT have the 'les_yeux' tag
        if (!hasBaseT1) {
            hasBaseT1 = newCompetences.some(c => c.nom === 'Terrifiant I' && (c as any).source !== 'les_yeux');
        }

        // Apply Logic: Reactive Swap
        if (hasBaseT1) {
            // Target: T2 (System)
            // Add T2 if missing
            if (!newCompetences.some(c => c.nom === 'Terrifiant II')) {
                const refComp = referenceCompetences.find(r => r.nom === 'Terrifiant II');
                newCompetences = [
                    ...newCompetences,
                    {
                        id: crypto.randomUUID(),
                        nom: 'Terrifiant II',
                        description: refComp?.description || '',
                        tableau: refComp?.tableau,
                        // @ts-ignore
                        source: 'les_yeux'
                    }
                ];
            }
            // Cleanup: Remove T1 (System) IF present (to avoid having both T1 and T2 from system)
            newCompetences = newCompetences.filter(c => !(c.nom === 'Terrifiant I' && (c as any).source === 'les_yeux'));
        }
        else {
            // Target: T1 (System)
            // Add T1 if missing
            const hasSystemT1 = newCompetences.some(c => c.nom === 'Terrifiant I' && (c as any).source === 'les_yeux');
            if (!hasSystemT1) {
                const refComp = referenceCompetences.find(r => r.nom === 'Terrifiant I');
                newCompetences = [
                    ...newCompetences,
                    {
                        id: crypto.randomUUID(),
                        nom: 'Terrifiant I',
                        description: refComp?.description || '',
                        tableau: refComp?.tableau,
                        // @ts-ignore
                        source: 'les_yeux'
                    }
                ];
            }
            // Cleanup: Remove T2 (System) IF present (Downgrade)
            newCompetences = newCompetences.filter(c => !(c.nom === 'Terrifiant II' && (c as any).source === 'les_yeux'));
        }
    } else {
        // If "Les yeux révolver" is REMOVED, we should strictly perform cleanup?
        // Current logic: If `hasYeux` is false, we do nothing.
        // User didn't explicitly ask for removal if "Les yeux" itself is removed, 
        // but it implies the bonus is lost.
        // For safety/completeness, we SHOULD remove system-added skills if the source is gone.

        // Cleanup ANY 'les_yeux' tagged skills if 'Les yeux révolver' is missing.
        newCompetences = newCompetences.filter(c => (c as any).source !== 'les_yeux');
    }

    return newCompetences;
};
