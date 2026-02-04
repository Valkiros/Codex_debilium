import { CharacterStatus } from '../types';

export type AlcoholType = 'leger' | 'fort' | 'gueule_de_bois';

// Structure defining modifiers for a specific dose/level
export interface AlcoholModifiers {
    courage: number;
    intelligence: number;
    charisme: number;
    adresse: number;
    force: number;
    perception: number;
    esquive: number;
    attaque: number;
    parade: number;
    pi: number; // Applied to Weapon Damage
}

// Helper to create empty modifiers
const zeroMods = (): AlcoholModifiers => ({
    courage: 0,
    intelligence: 0,
    charisme: 0,
    adresse: 0,
    force: 0,
    perception: 0,
    esquive: 0,
    attaque: 0,
    parade: 0,
    pi: 0
});

// Tables based on provided image
// Arrays are 1-based index (0 is unused or dose 0) typically, but here we can just map simple array index to Dose 1..10
// We'll use index 0 as Dose 1 to keep it simple, or index 1 as Dose 1 for clarity. Let's use 1-based indexing for clarity (index 0 will be empty).

const TABLE_ALCOOL_LEGER: AlcoholModifiers[] = [
    zeroMods(), // Dose 0 (Just in case)
    // Dose 1
    { ...zeroMods() },
    // Dose 2
    { ...zeroMods() },
    // Dose 3
    { ...zeroMods() },
    // Dose 4
    { ...zeroMods() },
    // Dose 5: COU 1, INT -1, PER -1
    { ...zeroMods(), courage: 1, intelligence: -1, perception: -1 },
    // Dose 6: COU 1, INT -1, AD -1, PER -1, AT 1
    { ...zeroMods(), courage: 1, intelligence: -1, adresse: -1, perception: -1, attaque: 1 },
    // Dose 7: COU 2, INT -2, CHA -1, AD -2, PER -2, AT 1
    { ...zeroMods(), courage: 2, intelligence: -2, charisme: -1, adresse: -2, perception: -2, attaque: 1 },
    // Dose 8: COU 2, INT -2, CHA -2, AD -2, FO 1, PER -2, AT 1
    { ...zeroMods(), courage: 2, intelligence: -2, charisme: -2, adresse: -2, force: 1, perception: -2, attaque: 1 },
    // Dose 9: COU 3, INT -3, CHA -3, AD -3, FO 2, PER -3, AT 2, PRD -2, PI -2
    { ...zeroMods(), courage: 3, intelligence: -3, charisme: -3, adresse: -3, force: 2, perception: -3, attaque: 2, parade: -2, pi: -2 },
    // Dose 10: COU 3, INT -3, CHA -4, AD -3, FO 2, PER -3, AT 2, PRD -2, PI -2
    { ...zeroMods(), courage: 3, intelligence: -3, charisme: -4, adresse: -3, force: 2, perception: -3, attaque: 2, parade: -2, pi: -2 },
];

const TABLE_ALCOOL_FORT: AlcoholModifiers[] = [
    zeroMods(), // Dose 0
    // Dose 1
    { ...zeroMods() },
    // Dose 2
    { ...zeroMods() },
    // Dose 3: INT -1, AD -1, PER -1
    { ...zeroMods(), intelligence: -1, adresse: -1, perception: -1 },
    // Dose 4: COU 1, INT -1, CHA -1, AD -2, PER -1
    { ...zeroMods(), courage: 1, intelligence: -1, charisme: -1, adresse: -2, perception: -1 },
    // Dose 5: COU 1, INT -2, CHA -1, AD -2, FO 1, PER -2, AT -1, PRD -1
    { ...zeroMods(), courage: 1, intelligence: -2, charisme: -1, adresse: -2, force: 1, perception: -2, attaque: -1, parade: -1 },
    // Dose 6: COU 2, INT -2, CHA -2, AD -3, FO 2, PER -2, AT 1, PRD -2, PI -2 (WAIT, Image for Strong 6 is AT 1 or AT - something?
    // Let's re-examine Alcool Forts Row 6.
    // Row 6: COU 2, INT -2, CHA -2, AD -3, FO 2, PER -2, ES empty, AT 1, PRD -2, PI -2
    { ...zeroMods(), courage: 2, intelligence: -2, charisme: -2, adresse: -3, force: 2, perception: -2, attaque: 1, parade: -2, pi: -2 },
    // Dose 7: COU 2, INT -3, CHA -2, AD -3, FO 2, PER -3, AT 1, PRD -2, PI -2
    { ...zeroMods(), courage: 2, intelligence: -3, charisme: -2, adresse: -3, force: 2, perception: -3, attaque: 1, parade: -2, pi: -2 },
    // Dose 8: COU 3, INT -3, CHA -3, AD -3, FO 3, PER -3, ES empty, AT 2, PRD -3, PI -3
    { ...zeroMods(), courage: 3, intelligence: -3, charisme: -3, adresse: -3, force: 3, perception: -3, attaque: 2, parade: -3, pi: -3 },
    // Dose 9: COU 3, INT -3, CHA -4, AD -3, FO 3, PER -3, AT 2, PRD -3, PI 1 (Total stats Row 9: COU 3, INT -3, CHA -4, AD -3, FO 3, PER -3, AT 2, PRD -3, PI 1)
    { ...zeroMods(), courage: 3, intelligence: -3, charisme: -4, adresse: -3, force: 3, perception: -3, attaque: 2, parade: -3, pi: 1 },
    // Dose 10: COU 3, INT -3, CHA -5, AD -3, FO 3, PER -3, AT 2, PRD -3, PI 2
    { ...zeroMods(), courage: 3, intelligence: -3, charisme: -5, adresse: -3, force: 3, perception: -3, attaque: 2, parade: -3, pi: 2 },
];

const TABLE_GUEULE_DE_BOIS: AlcoholModifiers[] = [
    zeroMods(), // Dose 0
    // Dose 1
    { ...zeroMods() },
    // Dose 2
    { ...zeroMods() },
    // Dose 3
    { ...zeroMods() },
    // Dose 4: INT -1, PER -1
    { ...zeroMods(), intelligence: -1, perception: -1 },
    // Dose 5: INT -1, PER -1 (Wait, is 5 same as 4? Image Row 5: INT -1, PER -1. Yes.)
    { ...zeroMods(), intelligence: -1, perception: -1 },
    // Dose 6: INT -1, CHA -1, PER -1
    { ...zeroMods(), intelligence: -1, charisme: -1, perception: -1 },
    // Dose 7: INT -1, CHA -1, PER -1 (Same as 6? Row 7: INT -1, CHA -1, PER -1. Yes.)
    { ...zeroMods(), intelligence: -1, charisme: -1, perception: -1 },
    // Dose 8: INT -2, CHA -1, AD -1, PER -2, AT -1, PRD -1
    { ...zeroMods(), intelligence: -2, charisme: -1, adresse: -1, perception: -2, attaque: -1, parade: -1 },
    // Dose 9: INT -2, CHA -2, AD -1, PER -2, AT -1, PRD -1
    { ...zeroMods(), intelligence: -2, charisme: -2, adresse: -1, perception: -2, attaque: -1, parade: -1 },
    // Dose 10: INT -2, CHA -3, AD -2, PER -2, ES -1, AT -1, PRD -1
    { ...zeroMods(), intelligence: -2, charisme: -3, adresse: -2, perception: -2, esquive: -1, attaque: -1, parade: -1 },
];


export const getAlcoholModifiers = (status: CharacterStatus) => {
    const leger = Math.min(Math.max(status.alcohol?.leger || 0, 0), 10);
    const fort = Math.min(Math.max(status.alcohol?.fort || 0, 0), 10);
    const gdb = Math.min(Math.max(status.alcohol?.gueule_de_bois || 0, 0), 10);

    const modsLeger = TABLE_ALCOOL_LEGER[leger] || zeroMods();
    const modsFort = TABLE_ALCOOL_FORT[fort] || zeroMods();
    const modsGdb = TABLE_GUEULE_DE_BOIS[gdb] || zeroMods();

    return {
        leger: modsLeger,
        fort: modsFort,
        gueule_de_bois: modsGdb
    };
};
