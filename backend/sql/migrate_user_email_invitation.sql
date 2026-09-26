ALTER TABLE Utilisateur
  ADD COLUMN email VARCHAR(255) NULL UNIQUE AFTER login,
  ADD COLUMN invitation_token_hash CHAR(64) NULL,
  ADD COLUMN invitation_expires_at DATETIME NULL;
