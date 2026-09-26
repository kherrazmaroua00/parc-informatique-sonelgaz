'use client';

import { useEffect, useState } from 'react';
import { Building2, Boxes, Users, Gauge, Search, Download, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import StatCard from '@/components/StatCard';
import StructureRow from '@/components/StructureRow';
import StructureFormModal from '@/components/StructureFormModal';

export default function StructuresPage() {
  const [structures, setStructures] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [typologyFilter, setTypologyFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    Promise.all([
      apiFetch('/structures'),
      apiFetch('/structures/stats'),
    ])
      .then(([structuresData, statsData]) => {
        setStructures(structuresData);
        setStats(statsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

function handleExport() {
  const headers = ['Code', 'Typologie', 'Site', 'Chef de structure', 'Poste', 'Equipements'];
  const rows = filteredStructures.map((s) => [
    s.nom_structure,
    s.typologie || '',
    s.site || '',
    s.chef_structure || '',
    s.poste_chef || '',
    s.nb_equipements,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `structures_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

  function handleEdit(structure) {
  setEditingStructure(structure);
  setModalOpen(true);
}

function handleAddNew() {
  setEditingStructure(null);
  setModalOpen(true);
}

async function handleFormSubmit(formData) {
  if (editingStructure) {
    await apiFetch(`/structures/${editingStructure.id_structure}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  } else {
    await apiFetch('/structures', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }
  setModalOpen(false);
  loadData();
}

  async function handleDelete(structure) {
    if (!confirm(`Supprimer la structure "${structure.nom_structure}" ?`)) return;

    try {
      await apiFetch(`/structures/${structure.id_structure}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

 const uniqueTypologies = [...new Set(structures.map((s) => s.typologie).filter(Boolean))];

const filteredStructures = structures.filter((s) => {
  const matchesSearch = s.nom_structure.toLowerCase().includes(search.toLowerCase());
  const matchesTypology = typologyFilter === 'all' || s.typologie === typologyFilter;
  return matchesSearch && matchesTypology;
});

  const totalEquipements = stats?.total_equipements || 0;

  if (loading) {
    return <p className="p-8 text-gray-500">Chargement...</p>;
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Parc informatique
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Structures</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={16} strokeWidth={1.75} />
            Exporter
          </button>
          <button onClick={handleAddNew} className="flex items-center gap-2 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus size={16} strokeWidth={1.75} />
            Ajouter une structure
          </button>
        </div>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Building2}
            label="Structures repertoriees"
            value={stats.total_structures}
            subtext="100% actives au referentiel"
          />
          <StatCard
            icon={Boxes}
            label="Actifs IT rattaches"
            value={stats.total_equipements}
            subtext="100% affectes a une structure"
          />
          <StatCard
            icon={Users}
            label="Chefs nommes"
            value={`${stats.total_chefs} / ${stats.total_structures}`}
            subtext={`Taux d'encadrement ${Math.round((stats.total_chefs / stats.total_structures) * 100)}%`}
          />
          <StatCard
            icon={Gauge}
            label="Charge materielle moyenne"
            value={`~${(stats.total_equipements / stats.total_structures).toFixed(1)}`}
            subtext="Equipements par entite"
          />
        </div>
      )}

            <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 text-black bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-black" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Rechercher par nom de structure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
        </div>

        <select
          value={typologyFilter}
          onChange={(e) => setTypologyFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-5 py-2 bg-white text-gray-700 outline-none"
        >
          <option value="all">Toutes les typologies ({structures.length})</option>
          {uniqueTypologies.map((t) => (
            <option key={t} value={t}>
              {t} ({structures.filter((s) => s.typologie === t).length})
            </option>
          ))}
        </select>

        <span className="text-xs text-gray-400 whitespace-nowrap ">
          {filteredStructures.length} structure{filteredStructures.length > 1 ? 's' : ''} enregistree{filteredStructures.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Code & typologie
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Chef de structure
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Equipements rattaches
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStructures.map((structure) => (
              <StructureRow
                key={structure.id_structure}
                structure={structure}
                totalEquipements={totalEquipements}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>

        {filteredStructures.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">
            Aucune structure trouvee.
          </p>
        )}
      </div>
      <StructureFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingStructure}
      />
    </main>
  );
}