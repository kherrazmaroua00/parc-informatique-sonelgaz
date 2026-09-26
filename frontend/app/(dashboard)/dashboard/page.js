'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Monitor,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
  Wrench,
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
    if (!user || user.role === 'admin') return;
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
  if (user.role === 'admin') return <AdminDashboard />;

  const total = Number(stats?.total || 0);
  const structureName = user.nom_structure || 'Votre structure';
  const percentage = (value) => total ? `${((Number(value || 0) / total) * 100).toFixed(1)}%` : '0%';

  return (
    <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />{structureName}
          </p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tableau de bord — {structureName}</h1>
          <p className="mt-1 text-sm text-slate-500">Aperçu du matériel affecté à votre structure.</p>
          <p className="mt-2 text-xs text-slate-600">Matricule : <strong>{user.login}</strong><span className="mx-2 text-slate-300">·</span>Profil : <strong>{user.role === 'chef_structure' ? 'Chef de structure' : 'Consultation'}</strong><span className="mx-2 text-slate-300">·</span><span className="text-emerald-700">Accès en lecture seule</span></p>
        </div>
        <Link href="/demandes/nouveau" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-sky-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-900">
          <Plus size={16} /> Nouvelle demande
        </Link>
      </section>

      <section className="mb-5 flex gap-3 rounded-lg border border-sky-100 bg-sky-50/70 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sky-100 text-sky-800"><ShieldCheck size={17} /></span>
        <div className="min-w-0">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800">Périmètre réglementaire et périmètre affecté</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">Les équipements affichés correspondent au périmètre de {structureName}. Les données sont consultables en lecture seule.</p>
        </div>
        <span className="ml-auto hidden shrink-0 self-center rounded bg-white px-2 py-1 text-xs font-medium text-slate-600 sm:block">Périmètre structure</span>
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

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [equipmentStats, equipmentResult, structures, stockStats, stockResult, demandStats] = await Promise.all([
        apiFetch('/equipements/stats'),
        apiFetch('/equipements?page=1&limit=1000'),
        apiFetch('/structures'),
        apiFetch('/consommables/stats'),
        apiFetch('/consommables?page=1&limit=100'),
        apiFetch('/demandes/stats'),
      ]);
      setDashboard({
        equipmentStats,
        equipements: equipmentResult.data || [],
        structures,
        stockStats,
        consommables: stockResult.data || [],
        demandStats,
      });
      setUpdatedAt(new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const equipmentStats = dashboard?.equipmentStats || {};
  const totalEquipment = Number(equipmentStats.total || 0);
  const criticalConsommables = (dashboard?.consommables || []).filter((item) => Number(item.quantite_stock) < 5);
  const popularConsommables = dashboard?.stockStats?.populaires || [];
  const structureRows = (dashboard?.structures || []).map((structure) => {
    const items = (dashboard?.equipements || []).filter((item) => item.id_structure === structure.id_structure);
    const total = items.length;
    const count = (etat) => items.filter((item) => item.etat === etat).length;
    return {
      ...structure,
      total,
      actif: count('actif'),
      enPanne: count('en_panne'),
      defectueux: count('defectueux'),
      reforme: count('reforme'),
      disponibilite: total ? Math.round((count('actif') / total) * 100) : 0,
    };
  });
  const visibleStructures = structureRows.filter((structure) =>
    `${structure.nom_structure} ${structure.chef_structure}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-7">
      <section className="mb-4 flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Parc informatique · Direction de Distribution de Saida</p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tableau de bord de supervision</h1>
          <p className="mt-1 text-xs text-slate-500">Vue consolidée du parc, du cycle de vie des équipements et des demandes de dotation.</p>
        </div>
        <button onClick={loadDashboard} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser {updatedAt && <span className="text-slate-400">{updatedAt}</span>}
        </button>
      </section>

      {error && <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 2xl:grid-cols-6">
        <AdminMetric icon={Boxes} label="Total équipements" value={equipmentStats.total} tone="navy" note="Postes, serveurs et périphériques" />
        <AdminMetric icon={CheckCircle2} label="Actifs / en service" value={equipmentStats.actif} tone="cyan" rate={totalEquipment ? `${((Number(equipmentStats.actif || 0) / totalEquipment) * 100).toFixed(1)}%` : '0%'} />
        <AdminMetric icon={Wrench} label="En maintenance" value={equipmentStats.en_panne} tone="blue" note="Intervention à suivre" />
        <AdminMetric icon={TriangleAlert} label="Défectueux" value={equipmentStats.defectueux} tone="red" note="Arrêt d’exploitation requis" />
        <AdminMetric icon={Archive} label="Proposés réforme" value={equipmentStats.reforme} tone="slate" note="Fin de cycle" />
        <AdminMetric icon={ClipboardList} label="Demandes DPS" value={dashboard?.demandStats?.en_attente} tone="navy" note="En attente d’arbitrage" />
      </section>

      <section className="mb-4 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        <AdminAction href="/equipements/nouveau" icon={Plus} title="Nouvelle saisie équipement" detail="Attribution inventaire & étiquette code-barres" />
        <AdminAction href="/demandes" icon={ClipboardList} title="Traiter les demandes DPS" detail="Validation des dotations et charges de sortie" count={dashboard?.demandStats?.en_attente} />
        <AdminAction href="/historique" icon={Eye} title="Journal de traçabilité" detail="Historique immuable des mouvements et réformes" />
      </section>

      <section className="mb-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Building2 size={15} className="text-sky-800" />Synthèse institutionnelle du parc par structure</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">Répartition des équipements et disponibilité opérationnelle</p>
          </div>
          <label className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2.5 py-2">
            <Search size={14} className="text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une structure" className="w-full min-w-0 text-xs outline-none placeholder:text-slate-400 sm:w-48" />
            <span className="hidden shrink-0 text-[10px] text-slate-400 sm:block">{structureRows.length} structures</span>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-blue-50/70 text-[9px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Structure / division</th>
                <th className="px-3 py-2.5">Responsable</th>
                <th className="px-3 py-2.5 text-center">Total parc</th>
                <th className="px-3 py-2.5 text-center">Actifs</th>
                <th className="px-3 py-2.5 text-center">En panne</th>
                <th className="px-3 py-2.5 text-center">Défectueux</th>
                <th className="px-3 py-2.5 text-center">Réforme</th>
                <th className="px-3 py-2.5">Disponibilité</th>
                <th className="px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStructures.map((structure) => (
                <tr key={structure.id_structure} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2.5"><span className="block text-xs font-semibold text-slate-800">{structure.nom_structure}</span><span className="text-[10px] text-slate-400">{structure.site || 'Direction de Distribution de Saida'}</span></td>
                  <td className="px-3 py-2.5"><span className="block text-[11px] font-semibold text-slate-700">{structure.chef_structure || 'Non renseigné'}</span><span className="text-[10px] text-slate-400">Chef de structure</span></td>
                  <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-700">{structure.total}</td>
                  <td className="px-3 py-2.5 text-center"><CountTag value={structure.actif} tone="cyan" /></td>
                  <td className="px-3 py-2.5 text-center"><CountTag value={structure.enPanne} tone="blue" /></td>
                  <td className="px-3 py-2.5 text-center"><CountTag value={structure.defectueux} tone="red" /></td>
                  <td className="px-3 py-2.5 text-center"><CountTag value={structure.reforme} tone="slate" /></td>
                  <td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-cyan-700" style={{ width: `${structure.disponibilite}%` }} /></span><span className="text-[10px] font-semibold text-slate-600">{structure.disponibilite}%</span></div></td>
                  <td className="px-3 py-2.5 text-center"><Link href="/structures" aria-label={`Voir ${structure.nom_structure}`} title="Voir la structure" className="inline-flex rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-sky-900"><Eye size={14} /></Link></td>
                </tr>
              ))}
              {!loading && visibleStructures.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400">Aucune structure trouvée.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-700" />Taux de disponibilité global : {totalEquipment ? `${((Number(equipmentStats.actif || 0) / totalEquipment) * 100).toFixed(1)}%` : '0%'}</span>
          <span>{totalEquipment.toLocaleString('fr-FR')} équipements recensés</span>
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><TriangleAlert size={15} className="text-red-600" />Alertes stocks critiques</h2>
            <span className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">{dashboard?.stockStats?.alertes ?? '—'} alertes</span>
          </div>
          <div className="space-y-2 p-3">
            {criticalConsommables.slice(0, 4).map((item) => {
              const out = Number(item.quantite_stock) === 0;
              return <Link key={item.id_consommable} href="/consommables" className="flex items-center justify-between gap-3 rounded border border-slate-100 bg-slate-50/70 px-3 py-2.5 hover:border-slate-200">
                <span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-800">{item.designation}</span><span className="text-[10px] text-slate-500">Seuil de sécurité : 5 unités</span></span>
                <span className={`shrink-0 text-right text-[10px] font-bold ${out ? 'text-red-600' : 'text-amber-700'}`}>{item.quantite_stock} unité{Number(item.quantite_stock) === 1 ? '' : 's'}<span className="block">{out ? 'Rupture imminente' : 'Stock faible'}</span></span>
              </Link>;
            })}
            {!loading && criticalConsommables.length === 0 && <p className="py-6 text-center text-xs text-slate-500">Aucune alerte de stock critique.</p>}
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5"><Link href="/consommables" className="text-[11px] font-semibold text-sky-800 hover:text-sky-950">Ouvrir le magasin central <ArrowRight size={12} className="ml-1 inline" /></Link></div>
        </div>

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Package size={15} className="text-cyan-700" />Consommables les plus sollicités</h2>
            <Link href="/consommables" className="text-[10px] font-semibold text-slate-500 hover:text-sky-900">En cours</Link>
          </div>
          <div className="space-y-2 p-3">
            {popularConsommables.map((item) => {
              const maxDemand = Math.max(1, ...popularConsommables.map((entry) => Number(entry.quantite_demandee)));
              const share = Math.round((Number(item.quantite_demandee) / maxDemand) * 100);
              return <div key={item.id_consommable} className="rounded border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-semibold text-slate-800">{item.designation}</span><span className="shrink-0 text-[10px] font-bold text-slate-700">{Number(item.quantite_demandee).toLocaleString('fr-FR')} demandées</span></div>
                <div className="mt-2 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-cyan-700" style={{ width: `${share}%` }} /></span><span className="text-[9px] font-medium text-slate-500">{item.type_consommable || 'Consommable'}</span></div>
              </div>;
            })}
            {!loading && popularConsommables.length === 0 && <p className="py-6 text-center text-xs text-slate-500">Aucune demande enregistrée.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminMetric({ icon: Icon, label, value, rate, note, tone }) {
  const tones = {
    navy: 'bg-[#102f52] text-white',
    cyan: 'bg-cyan-50 text-cyan-800',
    blue: 'bg-blue-50 text-blue-800',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return <div className="min-w-0 rounded-md border border-slate-200 bg-white p-3">
    <div className="flex items-start justify-between gap-1"><p className="min-h-7 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-500">{label}</p><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${tones[tone]}`}><Icon size={13} /></span></div>
    <div className="mt-1 flex items-end justify-between gap-1"><p className="text-2xl font-bold leading-none text-slate-900">{value ?? '—'}</p>{rate && <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[9px] font-bold text-cyan-800">{rate}</span>}</div>
    {note && <p className="mt-2 truncate text-[9px] text-slate-500">{note}</p>}
  </div>;
}

function AdminAction({ href, icon: Icon, title, detail, count }) {
  return <Link href={href} className="group flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-sky-300 hover:bg-sky-50/40">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#102f52] text-white"><Icon size={16} /></span>
    <span className="min-w-0 flex-1"><span className="flex items-center gap-1 text-xs font-bold text-slate-800">{title}{count > 0 && <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] text-white">{count}</span>}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">{detail}</span></span>
    <ArrowUpRight size={14} className="shrink-0 text-slate-400 group-hover:text-sky-800" />
  </Link>;
}

function CountTag({ value, tone }) {
  const tones = { cyan: 'bg-cyan-100 text-cyan-900', blue: 'bg-blue-100 text-blue-900', red: 'bg-red-100 text-red-800', slate: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex min-w-6 justify-center rounded px-1.5 py-1 text-[10px] font-bold ${tones[tone]}`}>{value}</span>;
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