const nodemailer = require('nodemailer');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
    throw new Error('Configuration SMTP manquante');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS || '' } : undefined,
  });
}

async function sendInvitation({ email, nom, login, token }) {
  const transport = createTransport();
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const setupUrl = `${frontendUrl}/set-password?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(nom);
  const safeLogin = escapeHtml(login);

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Activation de votre compte - Parc informatique',
    text: `Bonjour ${nom},\n\nVotre compte a ete cree. Votre identifiant est : ${login}.\nPour choisir votre mot de passe et activer votre compte, ouvrez ce lien (valable 24 heures) :\n${setupUrl}\n\nSi vous n'attendiez pas cet email, ignorez-le.`,
    html: `<p>Bonjour ${safeName},</p><p>Votre compte a ete cree. Votre identifiant est <strong>${safeLogin}</strong>.</p><p><a href="${setupUrl}">Choisir votre mot de passe et activer votre compte</a></p><p>Ce lien est valable 24 heures et ne peut etre utilise qu'une seule fois. Si vous n'attendiez pas cet email, ignorez-le.</p>`,
  });
}

module.exports = { sendInvitation };
