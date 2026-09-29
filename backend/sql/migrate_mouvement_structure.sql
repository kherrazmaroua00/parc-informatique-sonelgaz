ALTER TABLE Mouvement
  ADD COLUMN id_structure INT NULL AFTER id_demande,
  ADD COLUMN details VARCHAR(255) NULL AFTER id_structure;

UPDATE Mouvement m
LEFT JOIN Demande d ON d.id_demande = m.id_demande
LEFT JOIN Equipement e ON e.code_barre = m.code_barre
SET m.id_structure = COALESCE(d.id_structure, e.id_structure);

ALTER TABLE Mouvement
  ADD CONSTRAINT fk_mouvement_structure
  FOREIGN KEY (id_structure) REFERENCES Structure(id_structure);