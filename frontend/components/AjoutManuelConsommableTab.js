'use client';

import { useState } from 'react';
import { Tag, Building2, Info } from 'lucide-react';
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
      const result = await apiFetch('/consommables', { method: 'POST', body: JSON.stringify(form) });
      if (result.merged) {
        alert(`Ce consommable existait deja. Stock mis a jour : ${result.ancienne_quantite} + ${form.quantite_stock} = ${result.quantite_stock}.`);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{error}</p>}

      <div className="flex items-start gap-2 bg-blue-50 text-blue-800 text-sm leading-relaxed p-3 rounded-lg border border-blue-100">
        <Info size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
        <p>
          Si un consommable avec la meme designation ou reference existe deja, la quantite sera automatiquement ajoutee
          au stock existant au lieu de creer un doublon.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">Designation *</label>
          <input
            name="designation"
            value={form.designation}
            onChange={handleChange}
            required
            placeholder="Ex: Toner HP LaserJet CF283A (83A Noir)"
            className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-3 text-[15px] text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">Reference</label>
          <div className="flex items-center gap-2 border border-slate-300 bg-slate-50 rounded-lg px-3 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
            <Tag size={16} className="text-slate-700" strokeWidth={1.75} />
            <input name="reference" value={form.reference} onChange={handleChange} placeholder="REF-TON-HP-83A" className="flex-1 text-[15px] text-slate-900 placeholder:text-slate-500 bg-transparent outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">Type de consommable *</label>
          <select
            name="type_consommable"
            value={form.type_consommable}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-3 text-[15px] text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Selectionner un type...</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">Quantite a ajouter *</label>
          <input
            type="number"
            min="0"
            name="quantite_stock"
            value={form.quantite_stock}
            onChange={handleChange}
            required
            placeholder="12"
            className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-3 text-[15px] text-slate-900 placeholder:text-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">Emplacement / Casier magasin</label>
          <div className="flex items-center gap-2 border border-slate-300 bg-slate-50 rounded-lg px-3 py-3 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
            <Building2 size={16} className="text-slate-700" strokeWidth={1.75} />
            <input name="emplacement" value={form.emplacement} onChange={handleChange} placeholder="Magasin Central Saida" className="flex-1 text-[15px] text-slate-900 placeholder:text-slate-500 bg-transparent outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
        <button type="button" onClick={() => window.history.back()} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors">
          {saving ? 'Enregistrement...' : 'Enregistrer le consommable'}
        </button>
      </div>
    </form>
  );
}