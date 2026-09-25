import { SquarePen, Trash2 } from 'lucide-react';

export default function StructureRow({ structure, totalEquipements, onEdit, onDelete }) {
  const percentage = totalEquipements > 0
    ? ((structure.nb_equipements / totalEquipements) * 100).toFixed(1)
    : 0;

  const initials = structure.chef_structure
    ? structure.chef_structure
        .replace(/^(M\.|Mme)\s*/i, '')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 align-top">
        <p className="font-bold text-gray-900">{structure.nom_structure}</p>
        {structure.typologie && (
          <span className="inline-block mt-1 text-[11px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
            {structure.typologie}
          </span>
        )}
        {structure.site && (
          <p className="text-xs text-gray-400 mt-1">{structure.site}</p>
        )}
      </td>

      <td className="py-4 px-4 align-top">
        {structure.chef_structure ? (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{structure.chef_structure}</p>
              {structure.poste_chef && (
                <p className="text-xs text-gray-400">Poste {structure.poste_chef}</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Aucun chef designe</span>
        )}
      </td>

      <td className="py-4 px-4 align-top min-w-[180px]">
        <p className="text-sm font-semibold text-gray-900">
          {structure.nb_equipements} equipement{structure.nb_equipements > 1 ? 's' : ''}
          <span className="ml-2 text-xs font-normal text-gray-400">{percentage}% du parc</span>
        </p>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-slate-800 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </td>

      <td className="py-4 px-4 align-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(structure)}
            className="text-gray-400 hover:text-slate-800 transition-colors"
            title="Modifier"
          >
            <SquarePen size={17} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => onDelete(structure)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={17} strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}