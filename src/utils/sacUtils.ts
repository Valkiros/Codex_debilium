import { RefEquipement } from '../types';

/**
 * Calculates the weight of an item based on specific rules.
 * 
 * Rules:
 * - Standard: Uses refItem.poids or refItem.details.poids.
 * - Category 'Boissons': Defaults to 250g.
 * - Exception 'Outre d'abondance (enchantée)': 12.5g.
 * 
 * @param refItem The reference item data.
 * @returns The weight in grams as a number.
 */
export const getItemWeight = (refItem: RefEquipement | undefined): number => {
    if (!refItem) return 0;

    // Specific Rule for Boissons
    if (refItem.category === 'Boissons') {
        if (refItem.nom === "Outre d'abondance (enchantée)") {
            return 12.5;
        }
        return 250;
    }

    // Standard Logic (Robust check)
    const rawWeight = refItem.poids || (refItem as any)?.details?.poids || 0;

    // Ensure we handle strings if they come from JSON
    if (typeof rawWeight === 'string') {
        // Handle potential "g" suffix or commas if data is messy, though parseInt usually handles leading numbers
        // Using parseFloat to allow decimals if standard items start having them
        return parseFloat(rawWeight) || 0;
    }

    return rawWeight;
};

/**
 * Normalizes a rupture string to a numeric value (taking the upper bound of a range).
 * "Non", "NON", "" -> 0
 * "1" -> 1
 * "1à2", "1 à 2" -> 2
 * @param rupture The raw rupture string.
 * @returns The numeric upper bound.
 */
export const normalizeRuptureValue = (rupture: string | undefined): number => {
    if (!rupture) return 0;
    const s = rupture.toLowerCase().trim();
    if (s === 'non' || s === 'aucune' || s === '') return 0;

    // Handle ranges like "1à2" or "1 à 3"
    // We take the MAX value of the range as the base for calculation?
    // User said: "Ah mon objet a une rupture de '1à3' et une modif rupture de '1' alors je dois afficher sous rupture '1à4'"
    // This implies 1à3 + 1 = 1à4. So we are modifying the UPPER bound.
    // So we need to extract the upper bound, add the modifier, and then reconstructions "1à[NewMax]".

    // Actually, let's look at the patterns:
    // If it's just "1", "2" -> It's a single value (or start of 1..X ?)
    // Usually Rupture starts at 1. So "1" means "1".
    // "1à3" means range 1 to 3.

    // Let's rely on extracting the last number found.
    const parts = s.split(/à|to|-|\//); // Split by common separators
    const lastPart = parts[parts.length - 1].trim();
    const val = parseInt(lastPart);

    return isNaN(val) ? 0 : val;
};

/**
 * Calculates the final rupture display string.
 * @param baseRupture The base rupture string from the reference item (e.g. "1à2").
 * @param modifier The modifier value (e.g. 1).
 * @returns The formatted final rupture string (e.g. "1à3").
 */
export const calculateFinalRupture = (baseRupture: string | undefined, modifier: number = 0): string => {
    // 1. Get the numeric max value (0 if Non/Empty)
    const currentMax = normalizeRuptureValue(baseRupture);

    // 2. Apply modifier
    const newMax = currentMax + modifier;

    // 3. Format result
    if (newMax <= 0) return "Non";
    if (newMax === 1) return "1";

    return `1à${newMax}`;
};

/**
 * Generates a list of valid modifier options for a dropdown.
 * Ensuring Base + Mod <= 5.
 * @param baseRupture The base rupture string.
 * @returns Array of numbers [0, 1, ... maxMod]
 */
export const getMaxRuptureOptions = (baseRupture: string | undefined): number[] => {
    const baseVal = normalizeRuptureValue(baseRupture);
    const maxTotal = 6;

    // If base is already >= 5, allow only 0 (or strictly nothing if broken?)
    // But logically, if it's already 5, you can't add anything.
    if (baseVal >= maxTotal) return [0];

    const maxMod = maxTotal - baseVal;

    // Create array from 0 to maxMod
    return Array.from({ length: maxMod + 1 }, (_, i) => i);
};
