'use client';

import { useState } from 'react';
import { Mail, X } from 'lucide-react';

const emptyForm = { nom: '', login: '', email: '', role: 'consultation', id_structure: '' };
const fieldLabelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
const fieldControlClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20';

export default function UtilisateurFormModal({ open, onClose, onSubmit, onResend, initialData, structures }) {
  const [form, setForm] = useState(initialData ? {
    nom: initialData.nom || '', login: initialData.login || '', email: initialData.email || '',
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
          <h2 className="font-semibold text-gray-900">{initialData ? 'Modifier l’utilisateur' : 'Ajouter un utilisateur'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Fermer"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <div><label className={fieldLabelClass}>Nom complet *</label><input name="nom" value={form.nom} onChange={handleChange} required className={fieldControlClass} placeholder="Ex: M. Karim Benali" /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={fieldLabelClass}>Login *</label><input name="login" value={form.login} onChange={handleChange} required className={fieldControlClass} placeholder="k.benali" /></div><div><label className={fieldLabelClass}>Adresse e-mail *</label><input name="email" type="email" value={form.email} onChange={handleChange} required className={fieldControlClass} placeholder="nom@exemple.dz" /></div></div>
          {!initialData && <p className="-mt-2 text-xs text-slate-600">Un lien de création du mot de passe sera envoyé à cette adresse.</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={fieldLabelClass}>Type de compte</label><input value="Consultation (chef ou utilisateur)" readOnly className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none" /><input type="hidden" name="role" value="consultation" /></div><div><label className={fieldLabelClass}>Structure de rattachement *</label><select name="id_structure" value={form.id_structure} onChange={handleChange} required className={fieldControlClass}><option value="">Choisir une structure</option>{structures.map((structure) => <option key={structure.id_structure} value={structure.id_structure}>{structure.nom_structure}</option>)}</select></div></div>
          <div className="flex flex-wrap justify-between gap-2 pt-2">
            {initialData && <button type="button" disabled={saving || !initialData.email} onClick={async () => { setError(''); setSaving(true); try { await onResend(initialData); } catch (resendError) { setError(resendError.message); } finally { setSaving(false); } }} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Mail size={15} />Renvoyer le lien</button>}
            <div className="ml-auto flex gap-2"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button><button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Enregistrement...' : initialData ? 'Enregistrer' : 'Créer et envoyer le lien'}</button></div>
          </div>
        </form>
      </div>
    </div>
  );
}