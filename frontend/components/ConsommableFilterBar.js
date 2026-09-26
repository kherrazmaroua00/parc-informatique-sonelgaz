'use client';

import { Search } from 'lucide-react';

export default function ConsommableFilterBar({
  search, onSearchChange,
  typeFilter, onTypeChange, types,
  niveauFilter, onNiveauChange,
  totalCount, alertCount,
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <Search size={16} className="text-gray-400" strokeWidth={1.75} />
        <input
          type="text"
          placeholder="Rechercher par designation ou reference..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
      </div>

      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 outline-none"
      >
        <option value="">Tous les types ({types.length} categories)</option>
        {types.map((t) => (
          <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
        ))}
      </select>

      <select
        value={niveauFilter}
        onChange={(e) => onNiveauChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 outline-none"
      >
        <option value="">Tous les niveaux</option>
        <option value="rupture">Rupture de stock</option>
        <option value="faible">Stock faible</option>
        <option value="normal">Stock normal</option>
      </select>

      <span className="text-xs text-gray-400 whitespace-nowrap">
        {totalCount} references enregistrees • {alertCount} alertes
      </span>
    </div>
  );
}