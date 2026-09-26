# Backend setup

## Email invitations

New consultation users are created with an email address and receive a one-time password setup link. The link expires after 24 hours. Configure SMTP in `backend/.env` using the variables shown in `.env.example`; `FRONTEND_URL` must point to the deployed frontend. Use `SMTP_SECURE=true` with implicit-TLS SMTP (commonly port 465), or `false` with STARTTLS (commonly port 587).

For an existing database, apply `sql/migrate_user_email_invitation.sql` and `sql/migrate_user_roles.sql` once before starting the updated backend. The role migration adds the chef de structure role and updates existing structure chiefs. New databases receive these fields from `sql/schema.sql`.

Start the API with:

```sh
node src/server.js
```
