-- ============================================
-- Schema: parc_informatique
-- Based on the MLD from the cahier des charges
-- ============================================

CREATE TABLE Structure (
    id_structure INT AUTO_INCREMENT PRIMARY KEY,
    nom_structure VARCHAR(100) NOT NULL,
    chef_structure VARCHAR(100) NOT NULL
);

CREATE TABLE TypeEquipement (
    id_type INT AUTO_INCREMENT PRIMARY KEY,
    nom_type VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    invitation_token_hash CHAR(64) NULL,
    invitation_expires_at DATETIME NULL,
    role ENUM('admin', 'consultation') NOT NULL,
    id_structure INT NOT NULL,
    FOREIGN KEY (id_structure) REFERENCES Structure(id_structure)
);

CREATE TABLE Equipement (
    code_barre VARCHAR(50) PRIMARY KEY,
    numero_serie VARCHAR(100),
    designation VARCHAR(100) NOT NULL,
    marque VARCHAR(50),
    reference VARCHAR(50),
    annee_mise_en_service YEAR,
    etat ENUM('actif', 'en_panne', 'defectueux', 'reforme') NOT NULL DEFAULT 'actif',
    id_type INT NOT NULL,
    id_structure INT NOT NULL,
    FOREIGN KEY (id_type) REFERENCES TypeEquipement(id_type),
    FOREIGN KEY (id_structure) REFERENCES Structure(id_structure)
);

CREATE TABLE Caracteristique (
    id_caracteristique INT AUTO_INCREMENT PRIMARY KEY,
    nom_caracteristique VARCHAR(50) NOT NULL,
    valeur VARCHAR(100) NOT NULL,
    code_barre VARCHAR(50) NOT NULL,
    FOREIGN KEY (code_barre) REFERENCES Equipement(code_barre) ON DELETE CASCADE
);

CREATE TABLE Consommable (
    id_consommable INT AUTO_INCREMENT PRIMARY KEY,
    designation VARCHAR(100) NOT NULL,
    type_consommable VARCHAR(50),
    quantite_stock INT NOT NULL DEFAULT 0
);

CREATE TABLE Demande (
    id_demande INT AUTO_INCREMENT PRIMARY KEY,
    objet VARCHAR(255) NOT NULL,
    date_demande DATE NOT NULL,
    nom_agent VARCHAR(100) NOT NULL,
    etat_demande ENUM('en_attente', 'acceptee', 'refusee') NOT NULL DEFAULT 'en_attente',
    id_utilisateur INT NOT NULL,
    id_structure INT NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
    FOREIGN KEY (id_structure) REFERENCES Structure(id_structure)
);

CREATE TABLE LigneDemande (
    id_demande INT NOT NULL,
    id_consommable INT NOT NULL,
    quantite INT NOT NULL,
    PRIMARY KEY (id_demande, id_consommable),
    FOREIGN KEY (id_demande) REFERENCES Demande(id_demande) ON DELETE CASCADE,
    FOREIGN KEY (id_consommable) REFERENCES Consommable(id_consommable)
);

CREATE TABLE Mouvement (
    id_mouvement INT AUTO_INCREMENT PRIMARY KEY,
    date_mouvement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type_mouvement ENUM('affectation', 'remise_consommable', 'changement_etat') NOT NULL,
    quantite INT,
    id_consommable INT,
    code_barre VARCHAR(50),
    id_utilisateur INT NOT NULL,
    id_demande INT,
    FOREIGN KEY (id_consommable) REFERENCES Consommable(id_consommable),
    FOREIGN KEY (code_barre) REFERENCES Equipement(code_barre),
    FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
    FOREIGN KEY (id_demande) REFERENCES Demande(id_demande)
);