use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaseStats {
    pub esquive_naturelle: i32,
    // Add other stats as needed
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum EquipmentType {
    #[default]
    Armure,
    Arme,
    Sac,
    Autre,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Equipement {
    pub nom: String,
    #[serde(default)]
    pub equipement_type: EquipmentType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Etats {
    pub fatigue: i32,       // Value of malus
    pub alcool: i32,        // Value of malus
    pub drogue: i32,        // Value of malus
    pub blessure_tete: i32, // Value of malus
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinalStats {
    pub esquive_totale: i32,
    pub esquive_naturelle: i32,
    pub bonus_equipement: i32,
    pub malus_poids: i32,
    pub malus_etats: i32,
}

pub fn calculer_stats_finales(
    base: BaseStats,
    _equipements: Vec<Equipement>, // We don't use equipment list anymore for stats
    etats: Etats,
) -> FinalStats {
    // 1. Weight & Bonuses are disabled by user request
    let malus_poids = 0;
    let bonus_equipement = 0;

    // 2. Calculate State Malus
    let malus_etats = etats.fatigue + etats.alcool + etats.drogue + etats.blessure_tete;

    // 3. Final Calculation
    let raw_esquive = base.esquive_naturelle + bonus_equipement - malus_poids - malus_etats;

    // 4. Clamp to 0
    let esquive_totale = raw_esquive.max(0);

    FinalStats {
        esquive_totale,
        esquive_naturelle: base.esquive_naturelle,
        bonus_equipement,
        malus_poids,
        malus_etats,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_stats() -> BaseStats {
        BaseStats {
            esquive_naturelle: 10,
        }
    }

    fn mock_etats() -> Etats {
        Etats {
            fatigue: 0,
            alcool: 0,
            drogue: 0,
            blessure_tete: 0,
        }
    }

    #[test]
    fn test_esquive_basic() {
        let base = mock_stats();
        let etats = mock_etats();
        let eq = vec![];

        let final_stats = calculer_stats_finales(base, eq, etats);
        assert_eq!(final_stats.esquive_totale, 10);
    }

    #[test]
    fn test_esquive_with_equipment_bonus_ignored() {
        let base = mock_stats();
        let etats = mock_etats();
        let eq = vec![Equipement {
            nom: "Bottes agiles".to_string(),
            equipement_type: EquipmentType::Autre,
        }];

        let final_stats = calculer_stats_finales(base, eq, etats);
        // Bonus ignored -> 10
        assert_eq!(final_stats.esquive_totale, 10);
    }

    #[test]
    fn test_esquive_weight_penalty_ignored() {
        let base = mock_stats(); // 10
        let etats = mock_etats();
        let eq = vec![Equipement {
            nom: "Lourde armure".to_string(),
            equipement_type: EquipmentType::Armure,
        }];

        let final_stats = calculer_stats_finales(base, eq, etats);
        // Weight penalty ignored -> 10
        assert_eq!(final_stats.esquive_totale, 10);
    }

    #[test]
    fn test_esquive_mixed_modifiers_only_states() {
        let base = mock_stats(); // 10
        let mut etats = mock_etats();
        etats.fatigue = 1; // -1

        let eq = vec![Equipement {
            nom: "Bouclier".to_string(),
            equipement_type: EquipmentType::Armure,
        }];

        let final_stats = calculer_stats_finales(base, eq, etats);
        // 10 - 1 (fatigue) = 9
        assert_eq!(final_stats.esquive_totale, 9);
    }

    #[test]
    fn test_esquive_cannot_be_negative() {
        let base = BaseStats {
            esquive_naturelle: 0,
        };
        let mut etats = mock_etats();
        etats.fatigue = 10;

        let eq = vec![];

        let final_stats = calculer_stats_finales(base, eq, etats);
        assert_eq!(final_stats.esquive_totale, 0);
    }
}
