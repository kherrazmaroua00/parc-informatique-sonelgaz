'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Building2 } from 'lucide-react';

const emptyForm = {
  designation: '',
  reference: '',
  type_consommable: '',
  quantite_stock: '',
  emplacement: '',
};

const typeOptions = [
  'toner', 'unite_fusion', 'photoconducteur', 'developpeur',
  'carte_mere', 'bloc_alimentation', 'clavier', 'souris', 'ecran',
];

export default function ConsommableFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        designation: initialData.designation || '',
        reference: initialData.reference || '',
        type_consommable: initialData.type_consommable || '',
        quantite_stock: initialData.quantite_stock ?? '',
        emplacement: initialData.emplacement || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [initialData, open]);

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-xl">
        <div className="bg-slate-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">
              {isEditing ? 'Modifier le consommable' : 'Nouveau Consommable ou Piece Detachee'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enregistrement dans le referentiel magasin DSI Saida
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Designation *
              </label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                required
                placeholder="Ex: Toner HP LaserJet CF283A (83A Noir)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
              <p className="text-xs text-gray-400 mt-1">Nom exact du materiel, reference constructeur ou modele DSI.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Reference DSI
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-slate-800">
                <Tag size={15} className="text-gray-400" strokeWidth={1.75} />
                <input
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  placeholder="REF-TON-HP-83A"
                  className="flex-1 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Type de consommable *
              </label>
              <select
                name="type_consommable"
                value={form.type_consommable}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800 bg-white"
              >
                <option value="">Selectionner un type...</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Quantite en stock *
              </label>
              <input
                type="number"
                min="0"
                name="quantite_stock"
                value={form.quantite_stock}
                onChange={handleChange}
                required
                placeholder="12"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Emplacement / Casier magasin
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-slate-800">
                <Building2 size={15} className="text-gray-400" strokeWidth={1.75} />
                <input
                  name="emplacement"
                  value={form.emplacement}
                  onChange={handleChange}
                  placeholder="Magasin Central Saida — Travee B"
                  className="flex-1 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le consommable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}