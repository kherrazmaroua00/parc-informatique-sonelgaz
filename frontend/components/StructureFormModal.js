'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const emptyForm = {
  nom_structure: '',
  typologie: '',
  site: '',
  chef_structure: '',
  chef_utilisateur_id: '',
  poste_chef: '',
};

export default function StructureFormModal({ open, onClose, onSubmit, initialData, users = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [chefSearchOpen, setChefSearchOpen] = useState(false);
  const [chefSearch, setChefSearch] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        nom_structure: initialData.nom_structure || '',
        typologie: initialData.typologie || '',
        site: initialData.site || '',
        chef_structure: initialData.chef_structure || '',
        chef_utilisateur_id: users.find((user) => user.nom === initialData.chef_structure)?.id_utilisateur || '',
        poste_chef: initialData.poste_chef || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
    setChefSearch('');
    setChefSearchOpen(false);
  }, [initialData, open, users]);

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const availableUsers = users.filter((user) => (
    String(user.role).trim().toLowerCase() === 'consultation'
  ));
  const matchingUsers = availableUsers.filter((user) => (
    `${user.nom} ${user.login}`.toLowerCase().includes(chefSearch.toLowerCase())
  ));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {initialData ? 'Modifier la structure' : 'Ajouter une structure'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Renseignez les informations de rattachement.</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Code / nom de la structure *
            </label>
            <input
              name="nom_structure"
              value={form.nom_structure}
              onChange={handleChange}
              required
              placeholder="Ex: DRC"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Typologie
            </label>
            <input
              name="typologie"
              value={form.typologie}
              onChange={handleChange}
              placeholder="Ex: Division Technique"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Site
            </label>
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              placeholder="Ex: Siege Saida"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Chef de structure *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setChefSearchOpen(!chefSearchOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-base text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
                  aria-haspopup="listbox"
                  aria-expanded={chefSearchOpen}
                >
                  <span className={form.chef_structure ? 'text-slate-900' : 'text-slate-500'}>
                    {form.chef_structure || 'Rechercher un utilisateur de consultation'}
                  </span>
                  <Search size={18} className="text-slate-500" />
                </button>

                {chefSearchOpen && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-2 focus-within:border-sky-700 focus-within:ring-2 focus-within:ring-sky-700/20">
                      <Search size={16} className="text-slate-500" />
                      <input
                        autoFocus
                        value={chefSearch}
                        onChange={(event) => setChefSearch(event.target.value)}
                        placeholder="Nom ou login de consultation..."
                        className="min-w-0 flex-1 text-base text-gray-900 outline-none placeholder:text-gray-500"
                        aria-label="Rechercher un chef de structure"
                      />
                    </div>
                    <div className="flex items-center justify-between px-2.5 pb-1 pt-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {matchingUsers.length} utilisateur{matchingUsers.length > 1 ? 's' : ''}
                      </span>
                      {chefSearch && <span className="max-w-[55%] truncate text-xs text-slate-500">{chefSearch}</span>}
                    </div>
                    <div className="max-h-52 overflow-y-auto" role="listbox">
                      {matchingUsers.length > 0 ? matchingUsers.map((user) => (
                        <button
                          key={user.id_utilisateur}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, chef_structure: user.nom, chef_utilisateur_id: user.id_utilisateur });
                            setChefSearchOpen(false);
                            setChefSearch('');
                          }}
                          className={`block w-full rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-sky-50 ${form.chef_structure === user.nom ? 'bg-sky-50 text-sky-900' : 'text-slate-800'}`}
                          role="option"
                          aria-selected={form.chef_structure === user.nom}
                        >
                          <span className="font-medium">{user.nom}</span>
                          <span className="ml-2 text-slate-500">{user.login}</span>
                          {user.nom_structure && <span className="ml-2 text-xs text-slate-400">{user.nom_structure}</span>}
                        </button>
                      )) : (
                        <p className="px-2.5 py-3 text-sm text-slate-500">
                          {availableUsers.length === 0
                            ? 'Aucun utilisateur disponible pour cette structure.'
                            : 'Aucun utilisateur trouve.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Poste
              </label>
              <input
                name="poste_chef"
                value={form.poste_chef}
                onChange={handleChange}
                placeholder="Ex: 21-04"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}