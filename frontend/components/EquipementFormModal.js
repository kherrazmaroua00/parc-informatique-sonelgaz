'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const emptyForm = {
  code_barre: '',
  numero_serie: '',
  designation: '',
  marque: '',
  reference: '',
  annee_mise_en_service: '',
  etat: 'actif',
  id_type: '',
  id_structure: '',
};

const etatOptions = [
  { value: 'actif', label: 'Actif', desc: 'En service operationnel', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'en_panne', label: 'En panne', desc: 'Atelier DSI / Reparation', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'defectueux', label: 'Defectueux', desc: 'Non reparable local', color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'reforme', label: 'Reforme', desc: 'Dossier de radiation', color: 'border-gray-400 bg-gray-100 text-gray-600' },
];

// Defines which extra fields appear per equipment type, matching Caracteristique rows
const typeFieldsConfig = {
  PC: [
    { key: 'type_poste', label: 'Type de poste', type: 'select', options: ['Bureau (Unite Centrale)', 'Portable'] },
    { key: 'processeur_ram', label: 'Processeur & Memoire RAM', type: 'text', placeholder: 'Intel Core i5-10500 - 16 Go DDR4' },
    { key: 'disque', label: 'Disque & Capacite', type: 'text', placeholder: 'SSD 512 Go NVMe' },
  ],
  Imprimante: [
    { key: 'type_imprimante', label: "Type d'imprimante", type: 'select', options: ['Laser', 'Matricielle', 'Jet d\'encre'] },
    { key: 'couleur', label: 'Couleur', type: 'select', options: ['Noir & Blanc', 'Couleur'] },
  ],
  Onduleur: [
    { key: 'capacite', label: 'Capacite', type: 'text', placeholder: 'Ex: 650VA' },
  ],
  Scanner: [
    { key: 'format', label: 'Format', type: 'select', options: ['A4', 'A3', 'A0'] },
  ],
  Serveur: [
    { key: 'references_techniques', label: 'References techniques', type: 'text', placeholder: 'Ex: 2x Xeon, 32Go RAM, RAID5' },
  ],
  Switch: [
    { key: 'references_techniques', label: 'References techniques', type: 'text', placeholder: 'Ex: 24 ports Gigabit' },
  ],
};

export default function EquipementFormModal({ open, onClose, onSubmit, initialData, types, structures }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [caracteristiques, setCaracteristiques] = useState({});

useEffect(() => {
  if (initialData) {
    setForm({
      code_barre: initialData.code_barre || '',
      numero_serie: initialData.numero_serie || '',
      designation: initialData.designation || '',
      marque: initialData.marque || '',
      reference: initialData.reference || '',
      annee_mise_en_service: initialData.annee_mise_en_service || '',
      etat: initialData.etat || 'actif',
      id_type: initialData.id_type || '',
      id_structure: initialData.id_structure || '',
    });

    // Rebuild the { key: value } map from the saved Caracteristique rows
    const map = {};
    (initialData.caracteristiques || []).forEach((c) => {
      map[c.nom_caracteristique] = c.valeur;
    });
    setCaracteristiques(map);
  } else {
    setForm(emptyForm);
    setCaracteristiques({});
  }
  setError('');
}, [initialData, open]);

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCaracteristiqueChange(key, value) {
  setCaracteristiques({ ...caracteristiques, [key]: value });
}

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setSaving(true);
  try {
    const caracteristiquesArray = Object.entries(caracteristiques).map(([nom_caracteristique, valeur]) => ({
      nom_caracteristique,
      valeur,
    }));
    await onSubmit({ ...form, caracteristiques: caracteristiquesArray });
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
}

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isEditing ? 'Modifier l\'equipement' : 'Ajouter un equipement'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Code-barres *
              </label>
              <input
                name="code_barre"
                value={form.code_barre}
                onChange={handleChange}
                required
                disabled={isEditing}
                placeholder="SNL-SAI-PC-0145"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Numero de serie
              </label>
              <input
                name="numero_serie"
                value={form.numero_serie}
                onChange={handleChange}
                placeholder="CZC4120N8L"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Designation *
            </label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
              placeholder="Ordinateur HP ProDesk 400 G6 MT"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Marque *</label>
              <input
                name="marque"
                value={form.marque}
                onChange={handleChange}
                required
                placeholder="HP"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reference</label>
              <input
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="ProDesk 400 G6"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mise en service</label>
              <input
                type="number"
                name="annee_mise_en_service"
                value={form.annee_mise_en_service}
                onChange={handleChange}
                placeholder="2024"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type d'equipement *
              </label>
              <select
                name="id_type"
                value={form.id_type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800 bg-white"
              >
                <option value="">Selectionner...</option>
                {types.map((t) => (
                  <option key={t.id_type} value={t.id_type}>{t.nom_type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Structure d'affectation *
              </label>
              <select
                name="id_structure"
                value={form.id_structure}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800 bg-white"
              >
                <option value="">Selectionner...</option>
                {structures.map((s) => (
                  <option key={s.id_structure} value={s.id_structure}>{s.nom_structure}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Etat fonctionnel *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {etatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, etat: opt.value })}
                  className={`text-left border rounded-lg px-3 py-2 transition-colors ${
                    form.etat === opt.value ? opt.color : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-80">{opt.desc}</p>
                </button>
              ))}
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
              {saving ? 'Enregistrement...' : 'Enregistrer l\'equipement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}