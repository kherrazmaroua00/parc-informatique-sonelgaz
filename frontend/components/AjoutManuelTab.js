'use client';

import { useState } from 'react';
import { ScanBarcode, Hash, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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

const typeFieldsConfig = {
  PC: [
    { key: 'type_poste', label: 'Type de poste', type: 'select', options: ['Bureau (Unite Centrale)', 'Portable'] },
    { key: 'processeur_ram', label: 'Processeur & Memoire RAM', type: 'text', placeholder: 'Intel Core i5-10500 - 16 Go DDR4' },
    { key: 'disque', label: 'Disque & Capacite', type: 'text', placeholder: 'SSD 512 Go NVMe' },
  ],
  Imprimante: [
    { key: 'type_imprimante', label: "Type d'imprimante", type: 'select', options: ['Laser', 'Matricielle', "Jet d'encre"] },
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

const fieldLabelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
const fieldControlClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20';

export default function AjoutManuelTab({ types, structures, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [caracteristiques, setCaracteristiques] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      await apiFetch('/equipements', {
        method: 'POST',
        body: JSON.stringify({ ...form, caracteristiques: caracteristiquesArray }),
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedType = types.find((t) => String(t.id_type) === String(form.id_type));
  const dynamicFields = selectedType ? typeFieldsConfig[selectedType.nom_type] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</p>
      )}

      {/* Section 1 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center">01</span>
            <h2 className="font-semibold text-gray-900">Identification &amp; Tracabilite Materiel</h2>
          </div>
          <span className="text-xs text-gray-400">Matricule &amp; Numerotation d'inventaire</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabelClass}>
              Code-barres / Tag Patrimoine Sonelgaz *
            </label>
            <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-700/20">
              <ScanBarcode size={16} className="text-slate-500" strokeWidth={1.75} />
              <input
                name="code_barre"
                value={form.code_barre}
                onChange={handleChange}
                required
                placeholder="SNL-SAI-PC-0145"
                className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className={fieldLabelClass}>
              Numero de serie constructeur (S/N)
            </label>
            <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-700/20">
              <Hash size={16} className="text-slate-500" strokeWidth={1.75} />
              <input
                name="numero_serie"
                value={form.numero_serie}
                onChange={handleChange}
                placeholder="CZC4120N8L"
                className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={fieldLabelClass}>Designation usuelle *</label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
              placeholder="Ordinateur HP ProDesk 400 G6 MT"
              className={fieldControlClass}
            />
          </div>

          <div>
            <label className={fieldLabelClass}>Marque *</label>
            <input
              name="marque"
              value={form.marque}
              onChange={handleChange}
              required
              placeholder="HP"
              className={fieldControlClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={fieldLabelClass}>Reference</label>
              <input
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="ProDesk 400 G6"
                className={fieldControlClass}
              />
            </div>
            <div>
              <label className={fieldLabelClass}>Mise en service *</label>
              <input
                type="number"
                name="annee_mise_en_service"
                value={form.annee_mise_en_service}
                onChange={handleChange}
                required
                placeholder="2024"
                className={fieldControlClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center">02</span>
            <h2 className="font-semibold text-gray-900">Affectation &amp; Statut Reglementaire</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={fieldLabelClass}>
              Structure administrative / Entite d'affectation *
            </label>
            <select
              name="id_structure"
              value={form.id_structure}
              onChange={handleChange}
              required
              className={fieldControlClass}
            >
              <option value="">Selectionner...</option>
              {structures.map((s) => (
                <option key={s.id_structure} value={s.id_structure}>
                  {s.nom_structure}{s.typologie ? ` - ${s.typologie}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Entite responsable de l'actif au bilan patrimonial</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Etat fonctionnel initial *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {etatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, etat: opt.value })}
                  className={`text-left border rounded-lg px-2.5 py-2 transition-colors ${
                    form.etat === opt.value ? opt.color : 'border-gray-300 text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="mt-0.5 text-xs opacity-80">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center">03</span>
            <h2 className="font-semibold text-gray-900">Classification &amp; Caracteristiques Techniques</h2>
          </div>
        </div>

        <p className="mb-2 text-sm font-semibold text-slate-700">Selectionner le type d'equipement :</p>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {types.map((t) => (
            <button
              key={t.id_type}
              type="button"
              onClick={() => setForm({ ...form, id_type: t.id_type })}
              className={`text-center border rounded-lg px-3 py-3 transition-colors ${
                String(form.id_type) === String(t.id_type)
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <p className="text-xs font-semibold">{t.nom_type}</p>
            </button>
          ))}
        </div>

        {selectedType && (
          <>
            <div className="flex items-start gap-2 bg-blue-50 text-blue-700 text-xs p-3 rounded-lg mb-5">
              <ShieldCheck size={15} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              <p>
                Les champs de cette section s'adaptent automatiquement selon le type d'equipement selectionne ci-dessus
                (actuellement : <strong>{selectedType.nom_type}</strong>).
              </p>
            </div>

            {dynamicFields && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {dynamicFields.map((field) => (
                  <div key={field.key} className={field.type === 'select' && dynamicFields.length === 1 ? '' : ''}>
                    <label className={fieldLabelClass}>{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={caracteristiques[field.key] || ''}
                        onChange={(e) => handleCaracteristiqueChange(field.key, e.target.value)}
                        className={fieldControlClass}
                      >
                        <option value="">Selectionner...</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={caracteristiques[field.key] || ''}
                        onChange={(e) => handleCaracteristiqueChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={fieldControlClass}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          L'enregistrement genere automatiquement une entree horodatee dans le journal de tracabilite.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : "Enregistrer l'equipement"}
          </button>
        </div>
      </div>
    </form>
  );
}