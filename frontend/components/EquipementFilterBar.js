'use client';

import { Search, ListFilter, RotateCcw } from 'lucide-react';

export default function EquipementFilterBar({
  search, onSearchChange,
  typeFilter, onTypeChange, types,
  etatFilter, onEtatChange,
  structureFilter, onStructureChange, structures,
  onReset,
  activeFilterCount,
  showStructureFilter = true,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ListFilter size={16} strokeWidth={1.75} />
          Filtres de recherche et criteres d&apos;affichage
        </div>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} applique{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
          >
            <RotateCcw size={13} strokeWidth={1.75} />
            Reinitialiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Code-barres / N° serie / Designation
          </label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Ex: SNL-SAI-PC-0142 ou HP LaserJet..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Type d&apos;equipement
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white"
          >
            <option value="">Tous les types ({types.length})</option>
            {types.map((t) => (
              <option key={t.id_type} value={t.id_type}>{t.nom_type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Etat du materiel
          </label>
          <select
            value={etatFilter}
            onChange={(e) => onEtatChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white"
          >
            <option value="">Tous les etats</option>
            <option value="actif">Actif</option>
            <option value="en_panne">En panne</option>
            <option value="defectueux">Defectueux</option>
            <option value="reforme">Proposes reforme</option>
          </select>
        </div>

        {showStructureFilter && <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Structure de rattachement
          </label>
          <select
            value={structureFilter}
            onChange={(e) => onStructureChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white"
          >
            <option value="">Toutes les structures ({structures.length})</option>
            {structures.map((s) => (
              <option key={s.id_structure} value={s.id_structure}>{s.nom_structure}</option>
            ))}
          </select>
        </div>}
      </div>
    </div>
  );
}