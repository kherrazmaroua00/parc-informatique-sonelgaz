'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeftRight, Boxes, Download, FileClock, Filter, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const typeLabels = {
  remise_consommable: 'Remise consommable',
  affectation: 'Nouvelle affectation',
  changement_etat: "Changement d'etat",
};

const initialStats = { total: 0, remises: 0, affectations: 0, changements: 0 };

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return `${date.toLocaleDateString('fr-FR')} a ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function HistoriquePage() {
  const [rows, setRows] = useState([]);
  const [structures, setStructures] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [structure, setStructure] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/structures').then(setStructures).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search.trim()) params.set('search', search.trim());
      if (type) params.set('type', type);
      if (structure) params.set('id_structure', structure);
      if (dateDebut) params.set('date_debut', dateDebut);
      if (dateFin) params.set('date_fin', dateFin);

      try {
        const result = await apiFetch(`/historique?${params.toString()}`);
        if (!cancelled) {
          setRows(result.data || []);
          setStats(result.stats || initialStats);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, type, structure, dateDebut, dateFin, page, limit, refreshKey]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function buildParams() {
    const params = new URLSearchParams({ limit: '100' });
    if (search.trim()) params.set('search', search.trim());
    if (type) params.set('type', type);
    if (structure) params.set('id_structure', structure);
    if (dateDebut) params.set('date_debut', dateDebut);
    if (dateFin) params.set('date_fin', dateFin);
    return params;
  }

  async function exportJournal() {
    setExporting(true);
    try {
      const params = buildParams();
      let exportRows = [];
      let currentPage = 1;
      let total = 0;
      do {
        params.set('page', String(currentPage));
        const result = await apiFetch(`/historique?${params.toString()}`);
        exportRows = exportRows.concat(result.data || []);
        total = result.stats?.total || 0;
        currentPage += 1;
      } while (exportRows.length < total);

      const headers = ['Date et heure', 'Type de mouvement', 'Details', 'Code ou reference', 'Equipement ou consommable', 'Numero de serie', 'Quantite', 'Agent beneficiaire', 'Structure', 'Operateur', 'Reference demande'];
      const data = exportRows.map((row) => [
        formatDate(row.date_mouvement),
        typeLabels[row.type_mouvement] || row.type_mouvement,
        row.details,
        row.code_barre || row.reference_consommable || `CONS-${row.id_consommable || ''}`,
        row.designation,
        row.numero_serie,
        row.quantite,
        row.agent_beneficiaire,
        row.nom_structure,
        row.operateur,
        row.reference_demande,
      ]);
      const csv = [headers, ...data].map((line) => line.map(escapeCsv).join(';')).join('\r\n');
      const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `journal_mouvements_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  function resetFilters() {
    setSearch('');
    setType('');
    setStructure('');
    setDateDebut('');
    setDateFin('');
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(stats.total / limit));
  const firstRow = stats.total === 0 ? 0 : (page - 1) * limit + 1;
  const lastRow = Math.min(page * limit, stats.total);

  return (
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Parc informatique &gt; <span className="text-slate-800">Journal des mouvements</span></p>
          <h1 className="text-2xl font-bold text-slate-900">Historique</h1>
        </div>
        <button
          onClick={exportJournal}
          disabled={exporting || stats.total === 0}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <Download size={15} />{exporting ? 'Export en cours...' : 'Exporter le journal (Excel)'}
        </button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section aria-label="Synthese des mouvements" className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={FileClock} label="Mouvements enregistres" value={stats.total} detail="Dans la selection" tone="blue" />
        <SummaryCard icon={Boxes} label="Remises consommables" value={stats.remises} detail="Sorties liees aux demandes" tone="cyan" />
        <SummaryCard icon={ArrowLeftRight} label="Affectations" value={stats.affectations} detail="Equipements rattaches" tone="indigo" />
        <SummaryCard icon={AlertTriangle} label="Changements d'etat" value={stats.changements} detail="Mises a jour tracees" tone="red" />
      </section>

      <section className="mb-4 rounded-md border border-slate-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800"><Filter size={14} />Filtres du journal <span className="font-normal text-slate-500">{stats.total.toLocaleString('fr-FR')} enregistrements</span></div>
          <button onClick={resetFilters} className="text-[11px] font-medium text-slate-600 hover:text-slate-900">Reinitialiser les filtres</button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(130px,1fr))_auto]">
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 focus-within:border-sky-700">
            <Search size={15} className="shrink-0 text-slate-400" />
            <input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Code-barres, serie, agent..." className="min-w-0 flex-1 text-xs outline-none placeholder:text-slate-400" />
          </label>
          <select value={type} onChange={(event) => updateFilter(setType, event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-sky-700">
            <option value="">Tous les mouvements</option>
            <option value="remise_consommable">Remises consommables</option>
            <option value="affectation">Affectations</option>
            <option value="changement_etat">Changements d&apos;etat</option>
          </select>
          <select value={structure} onChange={(event) => updateFilter(setStructure, event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-sky-700">
            <option value="">Toutes les structures</option>
            {structures.map((item) => <option key={item.id_structure} value={item.id_structure}>{item.nom_structure}</option>)}
          </select>
          <input aria-label="Date de debut" type="date" value={dateDebut} onChange={(event) => updateFilter(setDateDebut, event.target.value)} className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-sky-700" />
          <input aria-label="Date de fin" type="date" value={dateFin} onChange={(event) => updateFilter(setDateFin, event.target.value)} className="min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-sky-700" />
          <button onClick={() => setRefreshKey((current) => current + 1)} aria-label="Actualiser le journal" title="Actualiser" className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"><RefreshCw size={14} /></button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#edf3ff] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Registre des mouvements</span>
          <span className="normal-case tracking-normal">Affichage de {firstRow} a {lastRow} sur {stats.total.toLocaleString('fr-FR')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed text-left">
            <thead className="bg-[#e7efff] text-[9px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-[12%] px-3 py-2">Date / heure / ref</th>
                <th className="w-[14%] px-3 py-2">Type de mouvement</th>
                <th className="w-[19%] px-3 py-2">Equipement ou consommable</th>
                <th className="w-[9%] px-3 py-2">Quantite</th>
                <th className="w-[13%] px-3 py-2">Agent beneficiaire</th>
                <th className="w-[12%] px-3 py-2">Structure</th>
                <th className="w-[14%] px-3 py-2">Operateur / source</th>
                <th className="w-[7%] px-3 py-2">Justificatif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-400">Chargement du journal...</td></tr>}
              {!loading && !error && rows.length === 0 && <tr><td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-400">Aucun mouvement pour ces filtres.</td></tr>}
              {!loading && rows.map((row) => (
                <tr key={row.id_mouvement} className="align-top text-[11px] text-slate-700 hover:bg-slate-50/70">
                  <td className="px-3 py-3"><p className="font-semibold text-slate-800">{formatDate(row.date_mouvement)}</p><p className="mt-1 text-[9px] text-slate-400">#MOUV-{String(row.id_mouvement).padStart(5, '0')}</p></td>
                  <td className="px-3 py-3"><MovementBadge type={row.type_mouvement} />{row.details && <p className="mt-1 leading-snug text-slate-500">{row.details}</p>}</td>
                  <td className="px-3 py-3"><p className="font-semibold text-slate-800">{row.code_barre || row.reference_consommable || `CONS-${row.id_consommable || ''}`}</p><p className="mt-1 leading-snug text-slate-500">{row.designation || '—'}</p>{row.numero_serie && <p className="mt-0.5 text-[9px] text-slate-400">Serie: {row.numero_serie}</p>}</td>
                  <td className="px-3 py-3">{row.quantite ? <span className="rounded-sm bg-slate-100 px-2 py-1 font-semibold text-slate-700">{row.quantite} {row.quantite > 1 ? 'unites' : 'unite'}</span> : <span className="text-slate-400">1 equipement</span>}</td>
                  <td className="px-3 py-3"><p className="font-medium text-slate-800">{row.agent_beneficiaire || '—'}</p></td>
                  <td className="px-3 py-3">{row.nom_structure ? <span className="rounded-sm bg-blue-50 px-1.5 py-1 text-[10px] font-semibold text-blue-800">{row.nom_structure}</span> : '—'}</td>
                  <td className="px-3 py-3"><p className="font-medium text-slate-700">{row.operateur || '—'}</p><p className="mt-1 text-[9px] text-slate-400">{row.login_operateur || ''}</p></td>
                  <td className="px-3 py-3 text-[10px] font-semibold text-sky-800">{row.reference_demande || (row.code_barre ? 'Equipement' : '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-[11px] text-slate-500">Afficher
            <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
              <option value={10}>10 lignes</option><option value={25}>25 lignes</option><option value={50}>50 lignes</option>
            </select>
            par page
          </label>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="rounded px-2.5 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100 disabled:opacity-40">Precedent</button>
            <span className="min-w-8 rounded bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-semibold text-white">{page}</span>
            <span className="px-1 text-xs text-slate-400">/ {totalPages}</span>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded px-2.5 py-1.5 text-[11px] text-slate-600 hover:bg-slate-100 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-md border border-blue-100 bg-[#e8f0ff] p-3 text-[11px] text-slate-600">
        <span className="mt-0.5 rounded bg-[#103d68] p-1.5 text-white"><ShieldCheck size={14} /></span>
        <div><p className="font-semibold text-slate-800">Journal consultable en lecture seule</p><p className="mt-0.5 leading-relaxed">Les mouvements sont enregistres lors des remises de consommables et des operations sur les equipements. Les donnees anterieures a leur tracabilite ne sont pas reconstituees.</p></div>
      </div>
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, tone }) {
  const toneClasses = {
    blue: 'text-blue-700 bg-blue-50',
    cyan: 'text-cyan-700 bg-cyan-50',
    indigo: 'text-indigo-700 bg-indigo-50',
    red: 'text-red-700 bg-red-50',
  };

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3.5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="mb-2 flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><span className={`rounded-sm p-1.5 ${toneClasses[tone]}`}><Icon size={15} /></span></div>
      <p className="text-2xl font-bold leading-none text-slate-900">{Number(value).toLocaleString('fr-FR')}</p>
      <p className="mt-2 text-[10px] text-slate-500">{detail}</p>
    </article>
  );
}

function MovementBadge({ type }) {
  const colors = {
    remise_consommable: 'bg-cyan-100 text-cyan-800',
    affectation: 'bg-blue-100 text-blue-800',
    changement_etat: 'bg-red-100 text-red-800',
  };

  return <span className={`inline-flex rounded-sm px-2 py-1 text-[9px] font-bold ${colors[type] || 'bg-slate-100 text-slate-700'}`}>{typeLabels[type] || type}</span>;
}