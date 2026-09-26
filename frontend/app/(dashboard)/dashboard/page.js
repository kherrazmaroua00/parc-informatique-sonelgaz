'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Monitor,
  Plus,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useStoredUser } from '@/lib/useStoredUser';

export default function DashboardPage() {
  const user = useStoredUser();
  const [stats, setStats] = useState(null);
  const [equipements, setEquipements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch('/equipements/stats'),
      apiFetch('/equipements?page=1&limit=5'),
    ])
      .then(([equipmentStats, equipmentResult]) => {
        setStats(equipmentStats);
        setEquipements(equipmentResult.data);
      })
      .catch((err) => setError(err.message));
  }, [user]);

  if (!user) return <p className="p-8 text-gray-500">Chargement...</p>;

  const isAdmin = user.role === 'admin';
  const total = Number(stats?.total || 0);
  const structureName = isAdmin ? '' : user.nom_structure || 'Votre structure';
  const percentage = (value) => total ? `${((Number(value || 0) / total) * 100).toFixed(1)}%` : '0%';

  return (
    <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />{structureName}
          </p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tableau de bord — {isAdmin ? 'Vue générale' : structureName}</h1>
          <p className="mt-1 text-sm text-slate-500">{isAdmin ? 'Suivi du parc informatique et de son état.' : 'Aperçu du matériel affecté à votre structure.'}</p>
          <p className="mt-2 text-xs text-slate-600">Matricule : <strong>{user.login}</strong><span className="mx-2 text-slate-300">·</span>Profil : <strong>{isAdmin ? 'Administrateur' : 'Consultation'}</strong><span className="mx-2 text-slate-300">·</span><span className="text-emerald-700">{isAdmin ? 'Accès global' : 'Accès en lecture seule'}</span></p>
        </div>
        <Link href="/demandes" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-sky-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-900">
          <Plus size={16} /> Nouvelle demande
        </Link>
      </section>

      <section className="mb-5 flex gap-3 rounded-lg border border-sky-100 bg-sky-50/70 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sky-100 text-sky-800"><ShieldCheck size={17} /></span>
        <div className="min-w-0">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">Périmètre réglementaire et périmètre affecté</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{isAdmin ? 'Vue globale : les équipements de toutes les structures sont inclus.' : `Les équipements affichés correspondent au périmètre de ${structureName}. Les données sont consultables en lecture seule.`}</p>
        </div>
        <span className="ml-auto hidden shrink-0 self-center rounded bg-white px-2 py-1 text-xs font-medium text-slate-600 sm:block">{isAdmin ? 'Accès administrateur' : 'Périmètre structure'}</span>
      </section>

      {error && <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Boxes size={16} />État du parc matériel <span className="font-medium text-slate-500">({total} unités)</span></h2>
          <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:block">Données actualisées en temps réel</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat icon={CheckCircle2} label="Actif / opérationnel" value={stats?.actif} rate={percentage(stats?.actif)} note="En service" tone="emerald" />
          <DashboardStat icon={AlertTriangle} label="En panne / atelier" value={stats?.en_panne} rate={percentage(stats?.en_panne)} note="Intervention requise" tone="amber" />
          <DashboardStat icon={XCircle} label="Défectueux" value={stats?.defectueux} rate={percentage(stats?.defectueux)} note="À diagnostiquer" tone="rose" />
          <DashboardStat icon={Monitor} label="Proposé réforme" value={stats?.reforme} rate={percentage(stats?.reforme)} note="Fin de cycle" tone="slate" />
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div className="flex items-center gap-2"><ClipboardList size={16} className="text-sky-900" /><h2 className="text-sm font-bold text-slate-900">Mes demandes récentes</h2></div>
            <Link href="/demandes" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-950">Voir mes demandes <ArrowRight size={13} /></Link>
          </div>
          <div className="p-4">
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 px-4 py-7 text-center">
              <ClipboardList size={21} className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">Aucune demande à afficher</p>
              <p className="mt-1 text-xs text-slate-500">Les demandes apparaîtront ici lorsqu’elles seront disponibles.</p>
              <Link href="/demandes" className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Plus size={14} />Accéder aux demandes</Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div><h2 className="text-sm font-bold text-slate-900">Équipements de ma structure</h2><p className="mt-0.5 text-[11px] text-slate-500">Matériel consultable</p></div>
            <Link href="/equipements" aria-label="Voir tous les équipements" className="rounded p-1.5 text-sky-800 hover:bg-sky-50"><ArrowRight size={16} /></Link>
          </div>
          <div className="space-y-2 p-3">
            {equipements.map((equipement) => <EquipmentItem key={equipement.code_barre} equipment={equipement} />)}
            {equipements.length === 0 && <p className="py-8 text-center text-xs text-slate-500">Aucun équipement à afficher.</p>}
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <Link href="/equipements" className="text-xs font-semibold text-sky-800 hover:text-sky-950">Consulter l’inventaire complet <ArrowRight className="ml-1 inline" size={13} /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardStat({ icon: Icon, label, value = '—', rate, note, tone }) {
  const tones = {
    emerald: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    amber: 'border-amber-500 text-amber-700 bg-amber-50',
    rose: 'border-rose-500 text-rose-700 bg-rose-50',
    slate: 'border-slate-400 text-slate-600 bg-slate-100',
  };
  const [border, color, background] = tones[tone].split(' ');
  return <div className={`rounded-md border border-slate-200 border-l-[3px] bg-white p-4 ${border}`}>
    <div className="flex items-start justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${background} ${color}`}>{rate}</span></div>
    <div className="mt-2 flex items-end gap-2"><p className="text-2xl font-bold leading-none text-slate-900">{value}</p><p className="mb-0.5 text-xs text-slate-500">équipements</p></div>
    <p className={`mt-3 flex items-center gap-1.5 text-[10px] font-semibold ${color}`}><Icon size={12} />{note}</p>
  </div>;
}

function EquipmentItem({ equipment }) {
  const status = {
    actif: ['Actif', 'bg-emerald-50 text-emerald-700'],
    en_panne: ['En panne', 'bg-amber-50 text-amber-700'],
    defectueux: ['Défectueux', 'bg-rose-50 text-rose-700'],
    reforme: ['Réforme', 'bg-slate-100 text-slate-600'],
  }[equipment.etat] || ['Non renseigné', 'bg-slate-100 text-slate-600'];

  return <div className="flex min-w-0 items-center gap-2.5 rounded-md bg-slate-50 p-2.5">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sky-100 text-sky-900"><Monitor size={15} /></span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-semibold text-slate-800">{equipment.designation}</p>
      <p className="truncate text-[10px] text-slate-500">{equipment.nom_type || equipment.marque || 'Équipement'} · {equipment.code_barre}</p>
    </div>
    <span className={`shrink-0 rounded px-1.5 py-1 text-[9px] font-bold ${status[1]}`}>{status[0]}</span>
  </div>;
}