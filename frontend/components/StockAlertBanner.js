'use client';

import { TriangleAlert, Filter } from 'lucide-react';

export default function StockAlertBanner({ rupture, faible, onFilterCritical }) {
  if (rupture === 0 && faible === 0) return null;

  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
      <div className="flex items-center gap-3">
        <TriangleAlert size={18} className="text-red-500" strokeWidth={1.75} />
        <p className="text-sm text-red-700">
          <strong>{rupture}</strong> article{rupture > 1 ? 's' : ''} en rupture de stock,{' '}
          <strong>{faible}</strong> article{faible > 1 ? 's' : ''} en stock faible
        </p>
        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full tracking-wide">
          ACTION REQUISE
        </span>
      </div>

      <button
        onClick={onFilterCritical}
        className="flex items-center gap-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
      >
        <Filter size={13} strokeWidth={1.75} />
        Filtrer uniquement ces {rupture + faible} articles critiques
      </button>
    </div>
  );
}