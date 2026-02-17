-- Ajout de la colonne user_id si elle n'existe pas
-- Cette colonne liera chaque personnage à son créateur (utilisateur connecte)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personnages' AND column_name = 'user_id') THEN 
        ALTER TABLE personnages ADD COLUMN user_id UUID DEFAULT auth.uid();
    END IF; 
END $$;

-- Activation de la sécurité RLS (Row Level Security)
-- Cela empêche par défaut tout accès si aucune politique n'est définie
ALTER TABLE personnages ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent pour éviter les conflits
-- IMPORTANT : On supprime aussi les politiques "Public" qui causaient la fuite de données
DROP POLICY IF EXISTS "Users can insert their own characters" ON personnages;
DROP POLICY IF EXISTS "Users can view their own characters" ON personnages;
DROP POLICY IF EXISTS "Users can update their own characters" ON personnages;
DROP POLICY IF EXISTS "Users can delete their own characters" ON personnages;

DROP POLICY IF EXISTS "Public Insert" ON personnages;
DROP POLICY IF EXISTS "Public Read" ON personnages;
DROP POLICY IF EXISTS "Public Update" ON personnages;

-- Création des politiques de sécurité
-- 1. INSERT : Un utilisateur ne peut insérer que s'il est authentifié et que le user_id correspond
CREATE POLICY "Users can insert their own characters" 
ON personnages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. SELECT : Un utilisateur ne voit que SES personnages
CREATE POLICY "Users can view their own characters" 
ON personnages FOR SELECT 
USING (auth.uid() = user_id);

-- 3. UPDATE : Un utilisateur ne peut modifier que SES personnages
CREATE POLICY "Users can update their own characters" 
ON personnages FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. DELETE : Un utilisateur ne peut supprimer que SES personnages
CREATE POLICY "Users can delete their own characters" 
ON personnages FOR DELETE 
USING (auth.uid() = user_id);
