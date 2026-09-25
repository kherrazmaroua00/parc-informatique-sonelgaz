'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Monitor, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useStoredUser } from '@/lib/useStoredUser';

export default function DashboardPage() {
  const user = useStoredUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    apiFetch('/equipements/stats')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [user]);

  if (!user) return <p className="p-8 text-gray-500">Chargement...</p>;

  const isAdmin = user.role === 'admin';
  const firstName = user.nom?.split(' ')[0] || 'Utilisateur';

  return (
    <main className="p-4 sm:p-8">
      <section className="mb-6 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm text-slate-300">Tableau de bord</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Bienvenue, {firstName}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {isAdmin ? 'Vue globale du parc informatique et administration des comptes.' : 'Espace de consultation de votre parc informatique.'}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 font-bold text-slate-900">{user.nom?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
            <div><p className="text-sm font-semibold">{user.nom}</p><p className="text-xs text-slate-300">{isAdmin ? 'Administrateur' : `Consultation · ${user.nom_structure || 'Structure'}`}</p></div>
          </div>
        </div>
      </section>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {stats && <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><DashboardStat icon={Monitor} label="Équipements" value={stats.total} color="bg-sky-100 text-sky-700" /><DashboardStat icon={CheckCircle2} label="Actifs" value={stats.actif} color="bg-emerald-100 text-emerald-700" /><DashboardStat icon={AlertTriangle} label="En panne" value={stats.en_panne} color="bg-orange-100 text-orange-700" />{isAdmin && <DashboardStat icon={Monitor} label="Structure" value={user.nom_structure || 'DSI'} color="bg-indigo-100 text-indigo-700" />}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2"><div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-slate-100 p-2"><ShieldCheck size={18} className="text-slate-700" /></span><div><h2 className="font-semibold text-gray-900">Accès de votre compte</h2><p className="text-sm text-gray-500">Informations liées à votre profil connecté</p></div></div><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Info label="Nom complet" value={user.nom} /><Info label="Identifiant" value={user.login} /><Info label="Profil" value={isAdmin ? 'Administrateur' : 'Consultation'} />{isAdmin && <Info label="Structure" value={user.nom_structure || 'Non renseignée'} />}</dl></section>
        <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-semibold text-gray-900">Raccourcis</h2><div className="mt-4 space-y-3"><a href="/equipements" className="block rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-800 hover:bg-slate-100">Consulter les équipements</a>{isAdmin && <a href="/utilisateurs" className="block rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-800 hover:bg-slate-100">Gérer les utilisateurs</a>}<a href="/historique" className="block rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-800 hover:bg-slate-100">Voir l&apos;historique</a></div></section>
      </div>
    </main>
  );
}

function DashboardStat({ icon: Icon, label, value, color }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm text-gray-500">{label}</p><span className={`rounded-lg p-2 ${color}`}><Icon size={18} /></span></div><p className="truncate text-2xl font-bold text-gray-900">{value}</p></div>;
}

function Info({ label, value }) {
  return <div className="border-b border-gray-100 pb-3"><dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 text-sm font-medium text-gray-800">{value}</dd></div>;
}