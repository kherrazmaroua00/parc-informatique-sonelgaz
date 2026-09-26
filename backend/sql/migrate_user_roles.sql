ALTER TABLE Utilisateur
  MODIFY role ENUM('admin', 'consultation', 'chef_structure') NOT NULL;

UPDATE Utilisateur u
JOIN Structure s ON s.id_structure = u.id_structure
SET u.role = 'chef_structure'
WHERE u.role = 'consultation'
  AND LOWER(TRIM(u.nom)) = LOWER(TRIM(s.chef_structure));