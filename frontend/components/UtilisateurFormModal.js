'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const emptyForm = { nom: '', login: '', password: '', role: 'consultation', id_structure: '' };

export default function UtilisateurFormModal({ open, onClose, onSubmit, initialData, structures }) {
  const [form, setForm] = useState(initialData ? {
    nom: initialData.nom || '', login: initialData.login || '', password: '',
    role: 'consultation', id_structure: initialData.id_structure || '',
  } : { ...emptyForm, role: 'consultation', id_structure: structures[0]?.id_structure || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({ ...form, id_structure: Number(form.id_structure) });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">{initialData ? 'Modifier l utilisateur' : 'Ajouter un utilisateur'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Fermer"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <div><label className="mb-1 block text-xs font-medium text-gray-500">Nom complet *</label><input name="nom" value={form.nom} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800" placeholder="Ex: M. Karim Benali" /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-medium text-gray-500">Login *</label><input name="login" value={form.login} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800" placeholder="k.benali" /></div><div><label className="mb-1 block text-xs font-medium text-gray-500">Mot de passe {initialData ? '' : '*'}</label><input name="password" type="password" value={form.password} onChange={handleChange} required={!initialData} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800" placeholder={initialData ? 'Laisser vide pour conserver' : 'Mot de passe'} /></div></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-medium text-gray-500">Type de compte</label><input value="Consultation (chef ou utilisateur)" readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 outline-none" /><input type="hidden" name="role" value="consultation" /></div><div><label className="mb-1 block text-xs font-medium text-gray-500">Structure de rattachement *</label><select name="id_structure" value={form.id_structure} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-800"><option value="">Choisir une structure</option>{structures.map((structure) => <option key={structure.id_structure} value={structure.id_structure}>{structure.nom_structure}</option>)}</select></div></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button><button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button></div>
        </form>
      </div>
    </div>
  );
}