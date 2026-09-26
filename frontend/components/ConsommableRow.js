import { SquarePen, Trash2 } from 'lucide-react';

const niveauStyles = {
  rupture: 'bg-red-50 text-red-700',
  faible: 'bg-amber-50 text-amber-700',
  normal: 'bg-emerald-50 text-emerald-700',
};

const niveauLabels = {
  rupture: 'Rupture de stock',
  faible: 'Stock faible (< 5)',
  normal: 'Stock normal',
};

export default function ConsommableRow({ consommable, onEdit, onDelete }) {
  const isCritical = consommable.niveau_stock !== 'normal';

  return (
    <tr className={`border-t border-gray-100 hover:bg-gray-50/60 transition-colors ${isCritical ? 'relative' : ''}`}>
      <td className="py-4 px-4 align-top relative">
        {isCritical && (
          <span
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              consommable.niveau_stock === 'rupture' ? 'bg-red-500' : 'bg-amber-400'
            }`}
          />
        )}
        <p className="text-sm font-medium text-gray-900">{consommable.designation}</p>
        <p className="text-xs text-gray-400 mt-1">
          {consommable.reference && <span className="font-medium text-gray-500">{consommable.reference}</span>}
          {consommable.reference && consommable.emplacement && ' • '}
          {consommable.emplacement}
        </p>
      </td>

      <td className="py-4 px-4 align-top">
        {consommable.type_consommable && (
          <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded capitalize">
            {consommable.type_consommable.replace(/_/g, ' ')}
          </span>
        )}
      </td>

      <td className="py-4 px-4 align-top">
        <p className={`text-sm font-semibold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
          {consommable.quantite_stock} unite{consommable.quantite_stock > 1 ? 's' : ''}
        </p>
      </td>

      <td className="py-4 px-4 align-top">
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${niveauStyles[consommable.niveau_stock]}`}>
          {niveauLabels[consommable.niveau_stock]}
        </span>
      </td>

      <td className="py-4 px-4 align-top">
        <div className="flex items-center gap-3">
          <button onClick={() => onEdit(consommable)} className="text-gray-400 hover:text-slate-800" title="Modifier">
            <SquarePen size={17} strokeWidth={1.75} />
          </button>
          <button onClick={() => onDelete(consommable)} className="text-gray-400 hover:text-red-600" title="Supprimer">
            <Trash2 size={17} strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}