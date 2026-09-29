-- Migration : ajout du role 'operateur'
--
-- ATTENTION : verifie d'abord la definition EXACTE actuelle de la colonne
-- role dans ton schema.sql (ou via `SHOW COLUMNS FROM Utilisateur LIKE 'role';`)
-- avant d'executer ce MODIFY COLUMN. L'ENUM ci-dessous suppose les valeurs
-- observees dans le code (admin, consultation, chef_structure) + operateur.
-- Adapte la liste si tmysql -u root -p parc_informatique -e "SHOW COLUMNS FROM Utilisateur LIKE 'role';"on schema en a d'autres.

ALTER TABLE Utilisateur
  MODIFY COLUMN role ENUM('admin', 'operateur', 'chef_structure', 'consultation') NOT NULL,
  MODIFY COLUMN id_structure INT NULL;

-- La creation d'un compte Operateur se fait maintenant via l'API existante
-- (POST /api/utilisateurs, comme pour consultation/chef_structure) --
-- utilisateurController.js et utilisateurModel.js ont ete mis a jour pour
-- l'accepter. Aucun insert manuel n'est necessaire.
