/**
 * Maps a specific character origin string to the corresponding key in APE_DATA.
 * Returns the key (e.g., 'barbare', 'humain', 'elfe', etc.)
 */
export const getApeOriginKey = (origin: string): string => {
    if (!origin) return 'humain'; // Default fallback

    const normalized = origin.toLowerCase().trim();

    // Mapping logic
    if (normalized.includes('barbare') || normalized.includes('amazone syldérienne') ||
        normalized.includes('loup-garou') || normalized.includes('minotaure') ||
        normalized.includes('homme-bête (canin)') || normalized.includes('femme-bête (canin)')) {
        return 'barbare';
    }
    if (normalized.includes('humain') || normalized.includes('humaine') ||
        normalized.includes('demi-elfe (h)') || normalized.includes('demie-elfe (h)') ||
        normalized.includes('demi-orque (h)') || normalized.includes('demie-orque (h)') ||
        normalized.includes('vampire') || normalized.includes('squelette sentient') ||
        normalized.includes('galéanthrope') || normalized.includes('wukong') ||
        normalized.includes('nelfe')) {
        return 'humain';
    }
    if (normalized.includes('elfe noir') || normalized.includes('incube') ||
        normalized.includes('succube') || normalized.includes('drac') ||
        normalized.includes('draque') || normalized.includes('kitsune') ||
        normalized.includes('naga')) {
        return 'elfe_noir';
    }
    // Check "elfe" AFTER "elfe noir" to avoid partial match issues
    if (normalized.includes('elfe sylvain') ||
        normalized.includes('haut elfe') || normalized.includes('haute elfe') ||
        normalized === 'elfe' || // Explicit Exact Match
        normalized === 'elfe' ||
        normalized.includes('demi-elfe (e)') || normalized.includes('demie-elfe (e)') ||
        normalized.includes('homme-lézard') || normalized.includes('femme-lézard') ||
        normalized.includes('fée')) {
        return 'elfe';
    }
    if (normalized.includes('orque') || normalized.includes('demi-orque (o)') ||
        normalized.includes('demie-orque (o)') || normalized.includes('ogre') ||
        normalized.includes('ogresse') || normalized.includes('gobelin') ||
        normalized.includes('gobeline') || normalized.includes('murloc') ||
        normalized.includes('troll') || normalized.includes('skaven') ||
        normalized.includes('changelin') || normalized.includes('changeline') ||
        normalized.includes('homme-légume') || normalized.includes('femme-légume') ||
        normalized.includes('demi-démon') || normalized.includes('demie-démone') ||
        normalized.includes('homme-bête (caprin)') || normalized.includes('femme-bête (caprin)') ||
        normalized.includes('homme-bête (bovin/porcin)') || normalized.includes('femme-bête (bovin/porcin)')) {
        return 'peau-verte';
    }
    if (normalized.includes('nain') || normalized.includes('naine') ||
        normalized.includes('nain de la mafia') || normalized.includes('naine de la mafia') ||
        normalized.includes('nain duregar') || normalized.includes('naine duregar') ||
        normalized.includes('harpie') || normalized.includes('profond') ||
        normalized.includes('profonde')) {
        return 'nain';
    }
    if (normalized.includes('gnôme') || normalized.includes('kobold') ||
        normalized.includes('tengu')) {
        return 'gnome';
    }
    if (normalized.includes('hobbit')) {
        return 'semi-homme';
    }

    // Default to humain if no match found
    return 'humain';
};
