'use client';

import { useState } from 'react';
import { Tag, Building2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const emptyForm = { designation: '', reference: '', type_consommable: '', quantite_stock: '', emplacement: '' };

const typeOptions = [
  'toner', 'unite_fusion', 'photoconducteur', 'developpeur',
  'carte_mere', 'bloc_alimentation', 'clavier', 'souris', 'ecran',
];

export default function AjoutManuelConsommableTab({ onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiFetch('/consommables', { method: 'POST', body: JSON.stringify(form) });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</p>}

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Designation *</label>
          <input
            name="designation"
            value={form.designation}
            onChange={handleChange}
            required
            placeholder="Ex: Toner HP LaserJet CF283A (83A Noir)"
            className="w-full min-h-11 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Reference DSI</label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-slate-800">
            <Tag size={15} className="text-gray-400" strokeWidth={1.75} />
            <input name="reference" value={form.reference} onChange={handleChange} placeholder="REF-TON-HP-83A" className="flex-1 text-base text-gray-900 placeholder:text-gray-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Type de consommable *</label>
          <select
            name="type_consommable"
            value={form.type_consommable}
            onChange={handleChange}
            required
            className="w-full min-h-11 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 outline-none focus:ring-2 focus:ring-slate-800 bg-white"
          >
            <option value="">Selectionner un type...</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Quantite en stock *</label>
          <input
            type="number"
            min="0"
            name="quantite_stock"
            value={form.quantite_stock}
            onChange={handleChange}
            required
            placeholder="12"
            className="w-full min-h-11 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Emplacement / Casier magasin</label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-slate-800">
            <Building2 size={15} className="text-gray-400" strokeWidth={1.75} />
            <input name="emplacement" value={form.emplacement} onChange={handleChange} placeholder="Magasin Central Saida" className="flex-1 text-base text-gray-900 placeholder:text-gray-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={() => window.history.back()} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
          Annuler
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer le consommable'}
        </button>
      </div>
    </form>
  );
}