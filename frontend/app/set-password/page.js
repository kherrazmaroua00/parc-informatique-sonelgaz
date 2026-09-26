'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [login, setLogin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('Ce lien est invalide. Demandez une nouvelle invitation à votre administrateur.');
      return;
    }

    setSaving(true);
    try {
      const result = await apiFetch('/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setLogin(result.login);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {login ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">Mot de passe défini</h1>
            <p className="mt-3 text-sm text-slate-600">Votre compte est activé. Connectez-vous avec l’identifiant :</p>
            <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 font-semibold text-slate-900">{login}</p>
            <Link href="/login" className="mt-6 inline-flex w-full justify-center rounded-md bg-sky-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-900">Aller à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Créer votre mot de passe</h1>
              <p className="mt-1 text-sm text-slate-600">Choisissez un mot de passe d’au moins 8 caractères pour activer votre compte.</p>
            </div>
            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">Nouveau mot de passe</label>
              <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20" />
            </div>
            <div>
              <label htmlFor="confirmation" className="mb-1.5 block text-sm font-semibold text-slate-700">Confirmer le mot de passe</label>
              <input id="confirmation" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20" />
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-md bg-sky-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-50">{saving ? 'Enregistrement...' : 'Activer mon compte'}</button>
          </form>
        )}
      </section>
    </main>
  );
}
