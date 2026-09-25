'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const emptyForm = {
  nom_structure: '',
  typologie: '',
  site: '',
  chef_structure: '',
  poste_chef: '',
};

export default function StructureFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        nom_structure: initialData.nom_structure || '',
        typologie: initialData.typologie || '',
        site: initialData.site || '',
        chef_structure: initialData.chef_structure || '',
        poste_chef: initialData.poste_chef || '',
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {initialData ? 'Modifier la structure' : 'Ajouter une structure'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Code / nom de la structure *
            </label>
            <input
              name="nom_structure"
              value={form.nom_structure}
              onChange={handleChange}
              required
              placeholder="Ex: DRC"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Typologie
            </label>
            <input
              name="typologie"
              value={form.typologie}
              onChange={handleChange}
              placeholder="Ex: Division Technique"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Site
            </label>
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              placeholder="Ex: Siege Saida"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Chef de structure
              </label>
              <input
                name="chef_structure"
                value={form.chef_structure}
                onChange={handleChange}
                placeholder="Ex: M. Ali Benali"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Poste
              </label>
              <input
                name="poste_chef"
                value={form.poste_chef}
                onChange={handleChange}
                placeholder="Ex: 21-04"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}