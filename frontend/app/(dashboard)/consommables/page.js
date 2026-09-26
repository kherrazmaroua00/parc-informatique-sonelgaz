'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import ConsommableFilterBar from '@/components/ConsommableFilterBar';
import ConsommableRow from '@/components/ConsommableRow';
import StockAlertBanner from '@/components/StockAlertBanner';
import Pagination from '@/components/Pagination';
import ConsommableFormModal from '@/components/ConsommableFormModal';
import { useRouter } from 'next/navigation';

export default function ConsommablesPage() {
  const [consommables, setConsommables] = useState([]);
  const [stats, setStats] = useState(null);
 const router = useRouter();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingConsommable, setEditingConsommable] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConsommables = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    if (!criticalOnly && niveauFilter) params.set('niveau', niveauFilter);
    params.set('page', page);
    params.set('limit', limit);

    apiFetch(`/consommables?${params.toString()}`)
      .then((result) => {
        let data = result.data;
        if (criticalOnly) {
          data = data.filter((c) => c.niveau_stock !== 'normal');
        }
        setConsommables(data);
        setTotal(criticalOnly ? data.length : result.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, typeFilter, niveauFilter, criticalOnly, page, limit]);

  useEffect(() => {
    loadConsommables();
  }, [loadConsommables]);

  useEffect(() => {
    apiFetch('/consommables/stats').then(setStats).catch(() => {});
  }, [consommables.length]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, niveauFilter, criticalOnly]);

  function handleFilterCritical() {
    setCriticalOnly(true);
    setNiveauFilter('');
  }

function handleAddNew() {
  router.push('/consommables/nouveau');
}

  function handleEdit(consommable) {
    setEditingConsommable(consommable);
    setModalOpen(true);
  }

  async function handleFormSubmit(formData) {
    if (editingConsommable) {
      await apiFetch(`/consommables/${editingConsommable.id_consommable}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
    } else {
      await apiFetch('/consommables', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }
    setModalOpen(false);
    loadConsommables();
  }

  async function handleDelete(consommable) {
    if (!confirm(`Supprimer "${consommable.designation}" ?`)) return;
    try {
      await apiFetch(`/consommables/${consommable.id_consommable}`, { method: 'DELETE' });
      loadConsommables();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleExport() {
    const headers = ['Designation', 'Reference', 'Type', 'Quantite', 'Niveau', 'Emplacement'];
    const rows = consommables.map((c) => [
      c.designation, c.reference || '', c.type_consommable || '', c.quantite_stock, c.niveau_stock, c.emplacement || '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consommables_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Parc informatique</p>
          <h1 className="text-2xl font-bold text-gray-900">Consommables</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus size={16} strokeWidth={1.75} />
            Ajouter un consommable
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} strokeWidth={1.75} />
            Export Excel
          </button>
        </div>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}

      {stats && (
        <StockAlertBanner
          rupture={stats.rupture}
          faible={stats.faible}
          onFilterCritical={handleFilterCritical}
        />
      )}

      {criticalOnly && (
        <div className="flex items-center justify-between bg-gray-100 text-xs text-gray-600 px-3 py-2 rounded-lg mb-4">
          <span>Filtre actif : articles critiques uniquement</span>
          <button onClick={() => setCriticalOnly(false)} className="font-medium underline">
            Retirer le filtre
          </button>
        </div>
      )}

      <ConsommableFilterBar
        search={search} onSearchChange={setSearch}
        typeFilter={typeFilter} onTypeChange={setTypeFilter} types={stats?.types || []}
        niveauFilter={niveauFilter} onNiveauChange={setNiveauFilter}
        totalCount={stats?.total || 0}
        alertCount={stats?.alertes || 0}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-blue-50/60">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Designation &amp; reference DSI</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type de consommable</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantite en stock</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Niveau de stock</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consommables.map((c) => (
              <ConsommableRow
                key={c.id_consommable}
                consommable={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>

        {!loading && consommables.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Aucun consommable trouve.</p>
        )}

        {!criticalOnly && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      <ConsommableFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingConsommable}
      />
    </main>
  );
}