import { Eye, SquarePen, Trash2, ArrowLeftRight, Cpu, Printer, BatteryCharging, Server, Network, ScanLine } from 'lucide-react';

const typeIcons = {
  PC: Cpu,
  Imprimante: Printer,
  Onduleur: BatteryCharging,
  Serveur: Server,
  Switch: Network,
  Scanner: ScanLine,
};

const etatStyles = {
  actif: 'bg-emerald-50 text-emerald-700',
  en_panne: 'bg-orange-50 text-orange-700',
  defectueux: 'bg-red-50 text-red-700',
  reforme: 'bg-gray-100 text-gray-500',
};

const etatLabels = {
  actif: 'Actif',
  en_panne: 'En panne',
  defectueux: 'Defectueux',
  reforme: 'Reforme',
};

export default function EquipementRow({ equipement, onView, onEdit, onDelete, onReassign }) {
  const TypeIcon = typeIcons[equipement.nom_type] || Cpu;

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-3 px-4 align-top">
        <div className="flex items-center gap-2">
          <TypeIcon size={16} className="text-gray-400" strokeWidth={1.75} />
          <span className="text-xs font-mono text-gray-700">{equipement.code_barre}</span>
        </div>
      </td>

      <td className="py-3 px-4 align-top max-w-xs">
        <p className="text-sm font-medium text-gray-900">{equipement.designation}</p>
        {equipement.numero_serie && (
          <p className="text-xs text-gray-400 mt-0.5">N/S: {equipement.numero_serie}</p>
        )}
      </td>

      <td className="py-3 px-4 align-top text-sm text-gray-600">{equipement.marque || '-'}</td>

      <td className="py-3 px-4 align-top">
        <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
          {equipement.nom_type}
        </span>
      </td>

      <td className="py-3 px-4 align-top text-sm text-gray-700">{equipement.nom_structure}</td>

      <td className="py-3 px-4 align-top">
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${etatStyles[equipement.etat]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {etatLabels[equipement.etat]}
        </span>
      </td>

      <td className="py-3 px-4 align-top text-sm text-gray-500">
        {equipement.annee_mise_en_service || '-'}
      </td>

      <td className="py-3 px-4 align-top">
        <div className="flex items-center gap-2.5">
          <button onClick={() => onView(equipement)} className="text-gray-400 hover:text-slate-800" title="Voir">
            <Eye size={16} strokeWidth={1.75} />
          </button>
          <button onClick={() => onEdit(equipement)} className="text-gray-400 hover:text-slate-800" title="Modifier">
            <SquarePen size={16} strokeWidth={1.75} />
          </button>
          <button onClick={() => onDelete(equipement)} className="text-gray-400 hover:text-red-600" title="Supprimer">
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      </td>

      <td className="py-3 px-4 align-top">
        <button
          onClick={() => onReassign(equipement)}
          className="text-gray-400 hover:text-blue-600"
          title="Reaffecter a une autre structure"
        >
          <ArrowLeftRight size={16} strokeWidth={1.75} />
        </button>
      </td>
    </tr>
  );
}