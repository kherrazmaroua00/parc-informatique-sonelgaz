import { X, Cpu, Printer, BatteryCharging, Server, Network, ScanLine, Package } from 'lucide-react';

const typeIcons = {
  PC: Cpu,
  Imprimante: Printer,
  Onduleur: BatteryCharging,
  Serveur: Server,
  Switch: Network,
  Scanner: ScanLine,
};

const etatConfig = {
  actif: { label: 'Actif', style: 'bg-emerald-50 text-emerald-700' },
  en_panne: { label: 'En panne', style: 'bg-orange-50 text-orange-700' },
  defectueux: { label: 'Defectueux', style: 'bg-red-50 text-red-700' },
  reforme: { label: 'Reforme', style: 'bg-gray-100 text-gray-600' },
};

function DetailItem({ label, value }) {
  return (
    <div className="border-b border-gray-100 py-3 last:border-b-0">
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-800">{value || '-'}</dd>
    </div>
  );
}

export default function EquipementDetailsPanel({ equipement, loading, error, onClose }) {
  if (!equipement) return null;

  const TypeIcon = typeIcons[equipement.nom_type] || Package;
  const etat = etatConfig[equipement.etat] || { label: equipement.etat || '-', style: 'bg-gray-100 text-gray-600' };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Fermer les details de l'equipement"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-details-title"
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-slate-100 p-2.5 text-slate-700">
              <TypeIcon size={20} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-400">Fiche equipement</p>
              <h2 id="equipment-details-title" className="mt-1 break-words text-lg font-semibold text-gray-900">
                {equipement.designation || 'Equipement'}
              </h2>
              <p className="mt-1 font-mono text-xs text-gray-500">{equipement.code_barre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && <p role="alert" className="mb-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {loading && <p role="status" className="mb-5 text-sm text-gray-500">Chargement des caracteristiques...</p>}

          <section aria-labelledby="equipment-general-title">
            <div className="mb-2 flex items-center justify-between">
              <h3 id="equipment-general-title" className="text-sm font-semibold text-gray-900">Informations generales</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${etat.style}`}>{etat.label}</span>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <DetailItem label="Code-barres" value={equipement.code_barre} />
              <DetailItem label="Numero de serie" value={equipement.numero_serie} />
              <DetailItem label="Designation" value={equipement.designation} />
              <DetailItem label="Marque" value={equipement.marque} />
              <DetailItem label="Reference" value={equipement.reference} />
              <DetailItem label="Annee de mise en service" value={equipement.annee_mise_en_service} />
              <DetailItem label="Type" value={equipement.nom_type} />
              <DetailItem label="Structure d'affectation" value={equipement.nom_structure} />
            </dl>
          </section>

          <section aria-labelledby="equipment-characteristics-title" className="mt-7">
            <h3 id="equipment-characteristics-title" className="mb-2 text-sm font-semibold text-gray-900">
              Caracteristiques techniques
            </h3>
            {equipement.caracteristiques?.length > 0 ? (
              <dl className="divide-y divide-gray-100 rounded-lg border border-gray-100 px-4">
                {equipement.caracteristiques.map((item) => (
                  <DetailItem key={item.id_caracteristique} label={item.nom_caracteristique} value={item.valeur} />
                ))}
              </dl>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-400">
                Aucune caracteristique technique renseignee.
              </p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}