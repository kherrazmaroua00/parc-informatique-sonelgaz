'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Download, Search, FolderOpen, ClipboardClock, ClipboardCheck, CircleCheckBig, RefreshCw, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import DemandeCard from '@/components/DemandeCard';
import StatCard from '@/components/StatCard';
import { useStoredUser } from '@/lib/useStoredUser';

export default function DemandesPage() {
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState(null);
  const [structures, setStructures] = useState([]);

  const [tab, setTab] = useState('toutes');
  const [search, setSearch] = useState('');
  const [structureFilter, setStructureFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useStoredUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) apiFetch('/structures').then(setStructures).catch(() => {});
  }, [isAdmin]);

  const loadDemandes = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (isAdmin && structureFilter) params.set('id_structure', structureFilter);
    if (tab === 'attente') params.set('etat', 'en_attente');
    if (tab === 'accorde') params.set('etat', 'accordee');

    apiFetch(`/demandes?${params.toString()}`)
      .then(setDemandes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAdmin, search, structureFilter, tab]);

  useEffect(() => {
    const timer = window.setTimeout(loadDemandes, 0);
    return () => window.clearTimeout(timer);
  }, [loadDemandes]);

  useEffect(() => {
    if (isAdmin) apiFetch('/demandes/stats').then(setStats).catch(() => {});
  }, [demandes.length, isAdmin]);

  async function handleAccorder(id) {
    try {
      await apiFetch(`/demandes/${id}/accorder`, { method: 'PATCH' });
      loadDemandes();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRefuser(id) {
    if (!confirm('Refuser cette demande ?')) return;
    try {
      await apiFetch(`/demandes/${id}/refuser`, { method: 'PATCH' });
      loadDemandes();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMarquerRemis(id) {
    try {
      await apiFetch(`/demandes/${id}/remettre`, { method: 'PATCH' });
      loadDemandes();
    } catch (err) {
      alert(err.message);
    }
  }

  function exportDemandes() {
    const statusLabels = {
      en_attente: 'En attente d\'arbitrage',
      accordee: 'Accordee',
      servie: 'Remise effectuee',
      refusee: 'Refusee',
    };
    const headers = ['N° DPS', 'Date', 'Agent', 'Structure', 'Objet', 'Etat', 'Consommables', 'Quantites'];
    const rows = demandes.map((demande) => [
      `DPS-${new Date(demande.date_demande).getFullYear()}-${String(demande.id_demande).padStart(3, '0')}`,
      new Date(demande.date_demande).toLocaleDateString('fr-FR'),
      demande.nom_agent,
      demande.nom_structure,
      demande.objet,
      statusLabels[demande.etat_demande] || demande.etat_demande,
      demande.lignes.map((ligne) => ligne.designation).join(' | '),
      demande.lignes.map((ligne) => ligne.quantite).join(' | '),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demandes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Parc informatique &gt; Demandes</p>
          <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Demandes' : 'Mes demandes'}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && <button onClick={exportDemandes} disabled={demandes.length === 0} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} strokeWidth={1.75} />Exporter le registre (Excel)</button>}
          {!isAdmin && <Link href="/demandes/nouveau" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Plus size={16} />Nouvelle demande</Link>}
        </div>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FolderOpen} label="Total DPS" value={stats.total} subtextDetail="Demandes enregistrees" />
          <StatCard icon={ClipboardClock} label="En attente d'arbitrage" value={stats.en_attente} subtext="Action DSI requise" />
          <StatCard icon={ClipboardCheck} label="Accordees a delivrer" value={stats.accordee} subtext="Pretes en casier magasin" />
          <StatCard icon={CircleCheckBig} label="Remises effectuees" value={stats.servie} subtextDetail="Decharges archivees" />
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-300 bg-white p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setTab('toutes')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              tab === 'toutes' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes {stats && <span className="ml-1 opacity-70">{stats.total}</span>}
          </button>
          <button
            onClick={() => setTab('attente')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              tab === 'attente' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            En attente {stats && <span className="ml-1 opacity-70">{stats.en_attente}</span>}
          </button>
          <button
            onClick={() => setTab('accorde')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              tab === 'accorde' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Accorde {stats && <span className="ml-1 opacity-70">{stats.accordee}</span>}
          </button>
        </div>

        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 transition focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-700/20">
          <Search size={16} className="text-gray-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Rechercher N° DPS, agent, objet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
          />
        </div>

        {isAdmin && (
          <select
            value={structureFilter}
            onChange={(e) => setStructureFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
          >
            <option value="">Toutes les structures</option>
            {structures.map((s) => (
              <option key={s.id_structure} value={s.id_structure}>{s.nom_structure}</option>
            ))}
          </select>
        )}
        <span className="flex items-center gap-2 px-2 text-xs text-slate-600">
          <span>{demandes.length} demandes</span>
          <button onClick={loadDemandes} aria-label="Actualiser" title="Actualiser" className="hover:text-slate-900"><RefreshCw size={14} /></button>
        </span>
      </div>

      {!loading && demandes.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-12">Aucune demande trouvee.</p>
      )}

      {demandes.map((demande) => (
        <DemandeCard
          key={demande.id_demande}
          demande={demande}
          canManage={isAdmin}
          onAccorder={handleAccorder}
          onRefuser={handleRefuser}
          onMarquerRemis={handleMarquerRemis}
        />
      ))}
    </main>
  );
}