'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, Plus, Boxes, CheckCircle2, AlertTriangle, XCircle, Archive } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import StatCardMini from '@/components/StatCardMini';
import EquipementFilterBar from '@/components/EquipementFilterBar';
import EquipementRow from '@/components/EquipementRow';
import Pagination from '@/components/Pagination';

export default function EquipementsPage() {
  const [equipements, setEquipements] = useState([]);
  const [stats, setStats] = useState(null);
  const [types, setTypes] = useState([]);
  const [structures, setStructures] = useState([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [etatFilter, setEtatFilter] = useState('');
  const [structureFilter, setStructureFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load static reference data once (types, structures)
  useEffect(() => {
    apiFetch('/structures').then(setStructures).catch(() => {});
    // TypeEquipement has no dedicated endpoint yet; derive types from equipment results for now
  }, []);

  const loadEquipements = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('id_type', typeFilter);
    if (etatFilter) params.set('etat', etatFilter);
    if (structureFilter) params.set('id_structure', structureFilter);
    params.set('page', page);
    params.set('limit', limit);

    apiFetch(`/equipements?${params.toString()}`)
      .then((result) => {
        setEquipements(result.data);
        setTotal(result.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, typeFilter, etatFilter, structureFilter, page, limit]);

  useEffect(() => {
    loadEquipements();
  }, [loadEquipements]);

  useEffect(() => {
    apiFetch('/equipements/stats').then(setStats).catch(() => {});
  }, [equipements.length]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, etatFilter, structureFilter]);

  // Derive the list of distinct types from currently loaded equipment (simple fallback)
  useEffect(() => {
    if (equipements.length > 0) {
      const map = new Map();
      equipements.forEach((e) => map.set(e.id_type, { id_type: e.id_type, nom_type: e.nom_type }));
      setTypes(Array.from(map.values()));
    }
  }, [equipements]);

  function handleReset() {
    setSearch('');
    setTypeFilter('');
    setEtatFilter('');
    setStructureFilter('');
  }

  function handleView(equipement) {
    console.log('view', equipement);
  }

  function handleEdit(equipement) {
    console.log('edit', equipement);
  }

  async function handleDelete(equipement) {
    if (!confirm(`Supprimer l'equipement "${equipement.code_barre}" ?`)) return;
    try {
      await apiFetch(`/equipements/${equipement.code_barre}`, { method: 'DELETE' });
      loadEquipements();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleReassign(equipement) {
    console.log('reassign', equipement);
  }

  function handleExport() {
    const headers = ['Code-barre', 'Designation', 'Marque', 'Type', 'Structure', 'Etat', 'Mise en service'];
    const rows = equipements.map((e) => [
      e.code_barre, e.designation, e.marque || '', e.nom_type, e.nom_structure, e.etat, e.annee_mise_en_service || '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipements_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeFilterCount = [search, typeFilter, etatFilter, structureFilter].filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Parc informatique</p>
          <h1 className="text-2xl font-bold text-gray-900">Equipements</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} strokeWidth={1.75} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus size={16} strokeWidth={1.75} />
            Ajouter un equipement
          </button>
        </div>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCardMini icon={Boxes} label="Total inventorie" value={stats.total} unit="unites" accentColor="bg-slate-800" />
          <StatCardMini icon={CheckCircle2} label="Actifs & en service" value={stats.actif} unit={`${((stats.actif / stats.total) * 100 || 0).toFixed(1)}%`} accentColor="bg-emerald-500" />
          <StatCardMini icon={AlertTriangle} label="En panne" value={stats.en_panne} unit="SAV / atelier" accentColor="bg-orange-500" />
          <StatCardMini icon={XCircle} label="Defectueux" value={stats.defectueux} unit="non reparables" accentColor="bg-red-500" />
          <StatCardMini icon={Archive} label="Proposes reforme" value={stats.reforme} unit="fin de vie" accentColor="bg-gray-400" />
        </div>
      )}

      <EquipementFilterBar
        search={search} onSearchChange={setSearch}
        typeFilter={typeFilter} onTypeChange={setTypeFilter} types={types}
        etatFilter={etatFilter} onEtatChange={setEtatFilter}
        structureFilter={structureFilter} onStructureChange={setStructureFilter} structures={structures}
        onReset={handleReset}
        activeFilterCount={activeFilterCount}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Code-barres</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Designation</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Marque</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Structure</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Etat</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Mise en svc</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Reaffectation</th>
            </tr>
          </thead>
          <tbody>
            {equipements.map((eq) => (
              <EquipementRow
                key={eq.code_barre}
                equipement={eq}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReassign={handleReassign}
              />
            ))}
          </tbody>
        </table>

        {!loading && equipements.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Aucun equipement trouve.</p>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </main>
  );
}