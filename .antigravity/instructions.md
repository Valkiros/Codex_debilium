# Project Instructions & Memory

## Project Overview
Tauri 2.0 application for Role Playing Games (JDR).
Targets: Windows, macOS, Android, iOS (iPad).

## Tech Stack
- **Backend**: Rust
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter

## Design System
- **Colors**:
    - Parchment: `#F0E6D2` (Custom yellow/beige)
    - Leather: `#8B4513` (Custom brown)
- **Typography**: Inter

## Notes
- Keep a clean structure.
- Document major changes here.
- Always speak in french.
- **IMPERATIF** : PARLER UNIQUEMENT EN FRANCAIS.

## UI/UX Guidelines & Harmonization

### 1. Containers & Boxes (Fiche, Inventaire, Compétences, Etat)
Tous les conteneurs principaux ("Box") doivent suivre ce style strict pour l'uniformité :
```tsx
className="bg-parchment/30 p-6 rounded-lg shadow-sm border border-leather/20 relative"
```
*Note : Ne jamais utiliser `bg-white/50` (rendu grisâtre en thème sombre).*

### 2. Typography & Density
Pour les panneaux denses (comme "Etat" ou les tableaux techniques), utiliser une taille de police calibrée :
- **Standard Text / Inputs / Labels** : `text-[13px]` (Intermédiaire entre xs et sm).
- **Titres de section** : `text-xl font-bold text-leather font-serif`.

### 3. Theming (Obsidian/Dark Mode Support)
- **Inputs** : Toujours utiliser la variable `bg-input-bg` (définie dans `index.css`) pour les champs de saisie, jamais de couleurs en dur.
- **Textes** : Utiliser les variables `text-leather`, `text-leather-dark`, `text-leather-light` qui s'adaptent automatiquement.