import { RefEquipement } from '../types';

export interface FieldDef {
    key: keyof RefEquipement | string; // key can be a nested path or direct key
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    options?: string[]; // For select
    width?: string;
    defaultValue?: any;
    // For nested keys like 'craft.composants', we might need special handling
    // For now, we'll assume flat access or handle it in the component
    // Actually, RefEquipement in the frontend seems to be flattened in the `items` state in AdminPanel.tsx 
    // based on the `mappedItems` logic.
    // Let's verify `RefEquipement` type. AdminPanel maps backend data to a flat `RefEquipement`.
}

// Common fields across most categories
const COMMON_FIELDS: FieldDef[] = [
    { key: 'niveau', label: 'Niveau', type: 'number', width: '60px' },
    { key: 'restriction', label: 'Restriction', type: 'text', width: '150px' },
    { key: 'origine_rarete', label: 'Origine/Rareté', type: 'text', width: '150px' },
    { key: 'type', label: 'Type', type: 'text', width: '120px' },
    { key: 'aura', label: 'Aura', type: 'text', width: '100px' },
];

const CRAFT_FIELDS: FieldDef[] = [
    { key: 'composants', label: 'Composants', type: 'textarea', width: '200px' },
    { key: 'outils', label: 'Outils', type: 'text', width: '150px' },
    { key: 'qualifications', label: 'Qualifications', type: 'text', width: '150px' },
    { key: 'difficulte', label: 'Difficulté', type: 'number', width: '80px' },
    { key: 'temps_de_confection', label: 'Temps', type: 'text', width: '100px' },
    { key: 'confection', label: 'Confection', type: 'textarea', width: '200px' },
    { key: 'xp_confection', label: 'XP Conf.', type: 'number', width: '80px' },
    { key: 'xp_reparation', label: 'XP Rép.', type: 'number', width: '80px' },
];

const CARACS_FIELDS: FieldDef[] = [
    { key: 'courage', label: 'Courage', type: 'number', width: '60px' },
    { key: 'intelligence', label: 'Intelligence', type: 'number', width: '60px' },
    { key: 'charisme', label: 'Charisme', type: 'number', width: '60px' },
    { key: 'adresse', label: 'Adresse', type: 'number', width: '60px' },
    { key: 'force', label: 'Force', type: 'number', width: '60px' },
    { key: 'perception', label: 'Perception', type: 'number', width: '60px' },
    { key: 'esquive', label: 'Esquive', type: 'number', width: '60px' },
    { key: 'attaque', label: 'Attaque', type: 'number', width: '60px' },
    { key: 'parade', label: 'Parade', type: 'number', width: '60px' },
    { key: 'mag_psy', label: 'Magie Psy', type: 'number', width: '60px' },
    { key: 'mag_phy', label: 'Magie Phy', type: 'number', width: '60px' },
    { key: 'rm', label: 'RM', type: 'number', width: '60px' },
    { key: 'mvt', label: 'Mvt', type: 'number', width: '60px' },
    { key: 'discretion', label: 'Discrétion', type: 'number', width: '60px' },
];

const RESIST_FIELDS: FieldDef[] = [
    { key: 'pr_sol', label: 'PR Sol', type: 'number', width: '70px' },
    { key: 'pr_spe', label: 'PR Spé', type: 'number', width: '70px' },
    { key: 'pr_mag', label: 'PR Mag', type: 'number', width: '70px' },
];

const ENV_FIELDS: FieldDef[] = [
    { key: 'pluie', label: 'Pluie', type: 'number', width: '60px' },
    { key: 'froid', label: 'Froid', type: 'number', width: '60px' },
    { key: 'chaleur', label: 'Chaleur', type: 'number', width: '60px' },
];

export const CATEGORY_SCHEMAS: Record<string, FieldDef[]> = {
    'Accessoires': [
        ...COMMON_FIELDS,
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        ...RESIST_FIELDS,
        { key: 'pi', label: 'PI', type: 'number', width: '60px' },
        ...CARACS_FIELDS,
        ...ENV_FIELDS,
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Armes': [
        ...COMMON_FIELDS,
        { key: 'mains', label: 'Mains', type: 'text', width: '80px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'degats', label: 'Dégâts', type: 'text', width: '100px' },
        { key: 'pi', label: 'PI', type: 'number', width: '60px' },
        ...CARACS_FIELDS.slice(0, 8),   // Courage, Intelligence, Charisme, Adresse, Force, Perception, Esquive, Attaque, Parade
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Armes_de_jet': [
        ...COMMON_FIELDS,
        { key: 'portee', label: 'Portée', type: 'text', width: '80px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'degats', label: 'Dégâts', type: 'text', width: '100px' },
        { key: 'pi', label: 'PI', type: 'number', width: '60px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Boissons': [
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' }
    ],
    'Bouffes': [
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'peremption', label: 'Peremption', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS.slice(0, 7) // Compositions, Outils, Qualifications, Difficulté, Temps de confection, Confection, XP Confection
    ],
    'Ingredients': [
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        { key: 'recolte', label: 'Récolte', type: 'text', width: '80px' }
    ],
    'Mains_nues': [
        ...COMMON_FIELDS,
        { key: 'mains', label: 'Mains', type: 'text', width: '80px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'degats', label: 'Dégâts', type: 'text', width: '100px' },
        { key: 'pi', label: 'PI', type: 'number', width: '60px' },
        ...CARACS_FIELDS.slice(0, 8),   // Courage, Intelligence, Charisme, Adresse, Force, Perception, Esquive, Attaque, Parade
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Munitions': [
        ...COMMON_FIELDS.slice(0, 3), // Niveau, Restriction, Origine
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        ...CRAFT_FIELDS
    ],
    'Objets_magiques': [
        { key: 'restriction', label: 'Restriction', type: 'text', width: '80px' },
        { key: 'charge', label: 'Charge', type: 'number', width: '60px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Objets_speciaux': [
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Outils': [
        ...COMMON_FIELDS.slice(0, 3),   // Niveau, Restriction, Origine -> le 3 n'est pas compté
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Pieges': [
        ...COMMON_FIELDS.slice(0, 3),   // Niveau, Restriction, Origine -> le 3 n'est pas compté
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Potions': [
        ...COMMON_FIELDS.slice(0, 4),   // Niveau, Restriction, Origine, Type -> le 4 n'est pas compté
        { key: 'contenant', label: 'Contenant', type: 'text', width: '80px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Protections': [
        ...COMMON_FIELDS,
        { key: 'matiere', label: 'Matière', type: 'text', width: '80px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        ...RESIST_FIELDS,
        ...CARACS_FIELDS,
        ...ENV_FIELDS,
        { key: 'couvre', label: 'Couvre', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Sacoches': [
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'places', label: 'Places', type: 'number', width: '60px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    'Sacs': [
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'capacite', label: 'Capacité', type: 'number', width: '60px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ],
    // Default fallback for others, using the 'Armes de jet' / etc structure which was similar
    'Default': [
        ...COMMON_FIELDS,
        { key: 'mains', label: 'Mains', type: 'text', width: '80px' },
        { key: 'prix', label: 'Prix', type: 'number', width: '80px' },
        { key: 'monnaie', label: 'Monnaie', type: 'text', width: '80px' },
        { key: 'degats', label: 'Dégâts', type: 'text', width: '100px' },
        { key: 'pi', label: 'PI', type: 'number', width: '60px' },
        ...CARACS_FIELDS,
        { key: 'effet', label: 'Effet', type: 'textarea', width: '250px' },
        { key: 'rupture', label: 'Rupture', type: 'text', width: '80px' },
        { key: 'poids', label: 'Poids (g)', type: 'number', width: '60px' },
        ...CRAFT_FIELDS
    ]
};

// Map other categories to Default or specific ones
const GENERIC_CATEGORIES = [
    'Compétences'
];

GENERIC_CATEGORIES.forEach(cat => {
    CATEGORY_SCHEMAS[cat] = CATEGORY_SCHEMAS['Default']; // or deep copy if needed
});