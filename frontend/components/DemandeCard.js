'use client';

import { useState } from 'react';
import { Printer, Keyboard, Layers, Package, TriangleAlert, CheckCircle2, FileText, Eye, Truck } from 'lucide-react';

const etatConfig = {
  en_attente: { label: "En attente d'arbitrage", color: 'bg-amber-50 text-amber-700', border: 'border-l-amber-400' },
  accordee: { label: 'Accordee (Prete pour retrait)', color: 'bg-emerald-50 text-emerald-700', border: 'border-l-emerald-400' },
  servie: { label: 'Remise effectuee', color: 'bg-blue-50 text-blue-700', border: 'border-l-blue-400' },
  refusee: { label: 'Refusee', color: 'bg-gray-100 text-gray-500', border: 'border-l-gray-300' },
};

const typeIcons = {
  toner: Printer,
  photoconducteur: Printer,
  developpeur: Printer,
  unite_fusion: Printer,
  clavier: Keyboard,
  souris: Keyboard,
  ecran: Layers,
  carte_mere: Layers,
  bloc_alimentation: Layers,
};

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function DemandeCard({ demande, onAccorder, onRefuser, onMarquerRemis, canManage = true }) {
  const [working, setWorking] = useState(false);
  const config = etatConfig[demande.etat_demande];

  const hasStockAlert = demande.lignes.some((l) => l.alerte_stock);
  const cadenceAlerts = demande.lignes.filter((l) => l.alerte_cadence);

  async function handleAction(fn) {
    setWorking(true);
    try {
      await fn(demande.id_demande);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className={`mb-4 rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:p-5 ${config.border}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center">
            {getInitials(demande.nom_agent)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{demande.nom_agent}</p>
            <p className="text-xs text-gray-400">{demande.nom_structure} — {demande.objet}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            DPS-{new Date(demande.date_demande).getFullYear()}-{String(demande.id_demande).padStart(3, '0')}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="mb-3 space-y-2">
        {demande.lignes.map((ligne) => {
          const Icon = typeIcons[ligne.type_consommable] || Package;
          return (
            <div key={ligne.id_consommable} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Icon size={15} className="text-gray-400" strokeWidth={1.75} />
                {ligne.designation}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">Qte: <strong className="text-gray-700">{ligne.quantite}</strong></span>
                <span className={ligne.alerte_stock ? 'text-red-600 font-medium' : 'text-gray-400'}>
                  Stock: {ligne.quantite_stock}
                </span>
                {ligne.alerte_stock === 'rupture' && (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <TriangleAlert size={12} strokeWidth={2} /> Rupture
                  </span>
                )}
                {ligne.alerte_stock === 'insuffisant' && (
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <TriangleAlert size={12} strokeWidth={2} /> Stock insuffisant
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasStockAlert && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-3">
          <TriangleAlert size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          <p>Stock insuffisant pour satisfaire cette demande en totalite. Verifiez les quantites avant d&apos;accorder.</p>
        </div>
      )}

      {cadenceAlerts.length > 0 ? (
        <div className="flex items-center justify-between bg-amber-50 text-amber-700 text-xs p-3 rounded-lg mb-3">
          <span>
            Derniere dotation il y a {cadenceAlerts[0].derniere_dotation_jours} jours. Cadence rapprochee.
          </span>
        </div>
      ) : demande.lignes.some((l) => l.derniere_dotation_jours !== null) && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <CheckCircle2 size={13} strokeWidth={1.75} className="text-emerald-500" />
          Derniere dotation de cet agent : il y a {Math.round(demande.lignes.find((l) => l.derniere_dotation_jours !== null).derniere_dotation_jours / 30)} mois (conforme aux normes)
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800">
          <FileText size={14} strokeWidth={1.75} />
          Bordereau scanne (PDF)
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {canManage && demande.etat_demande === 'en_attente' && (
            <>
              <button
                onClick={() => handleAction(onRefuser)}
                disabled={working}
                className="text-xs font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg disabled:opacity-50"
              >
                Refuser
              </button>
              <button
                onClick={() => handleAction(onAccorder)}
                disabled={working}
                className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Accorder la dotation
              </button>
            </>
          )}

          {canManage && demande.etat_demande === 'accordee' && (
            <button
              onClick={() => handleAction(onMarquerRemis)}
              disabled={working}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Truck size={14} strokeWidth={1.75} />
              Marquer comme remis
            </button>
          )}

          {canManage && demande.etat_demande === 'servie' && (
            <span className="text-xs text-gray-400">Sortie stock confirmee</span>
          )}
        </div>
      </div>
    </div>
  );
}