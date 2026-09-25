'use client';

import { useEffect, useState } from 'react';
import { Download, Edit3, Eye, KeyRound, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import StatCard from '@/components/StatCard';
import UtilisateurFormModal from '@/components/UtilisateurFormModal';

export default function UtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [structures, setStructures] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { loadData(); }, []);

  function loadData() {
    setLoading(true);
    Promise.all([apiFetch('/utilisateurs'), apiFetch('/utilisateurs/stats'), apiFetch('/structures')])
      .then(([userData, statsData, structureData]) => { setUsers(userData); setStats(statsData); setStructures(structureData); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = `${user.nom} ${user.login} ${user.nom_structure}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (roleFilter === 'all' || user.role === roleFilter);
  });

  function exportUsers() {
    const rows = [['Nom', 'Login', 'Role', 'Structure'], ...filteredUsers.map((user) => [user.nom, user.login, user.role, user.nom_structure])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  async function submitUser(formData) {
    const endpoint = editingUser ? `/utilisateurs/${editingUser.id_utilisateur}` : '/utilisateurs';
    await apiFetch(endpoint, { method: editingUser ? 'PUT' : 'POST', body: JSON.stringify(formData) });
    setModalOpen(false); loadData();
  }

  async function deleteUser(user) {
    if (!confirm(`Supprimer l utilisateur "${user.nom}" ?`)) return;
    try { await apiFetch(`/utilisateurs/${user.id_utilisateur}`, { method: 'DELETE' }); loadData(); } catch (err) { alert(err.message); }
  }

  if (loading) return <p className="p-8 text-gray-500">Chargement...</p>;

  return (
    <main className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Parc informatique &gt; Utilisateurs</p><h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1></div><div className="flex items-center gap-3"><button onClick={exportUsers} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"><Download size={16} /> Exporter la liste</button><button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Plus size={16} /> Ajouter un utilisateur</button></div></div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {stats && <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard icon={Users} label="Total utilisateurs" value={stats.total_utilisateurs} subtext="Comptes enregistrés sur le SI" /><StatCard icon={ShieldCheck} label="Rôle administrateur" value={stats.total_admins} subtext="Accès complet & arbitrage global" /><StatCard icon={Eye} label="Rôle consultation" value={stats.total_consultation} subtext="Accès restreint à l&apos;entité" /><StatCard icon={KeyRound} label="Taux d&apos;affectation" value={`${stats.total_utilisateurs ? Math.round((stats.utilisateurs_affectes / stats.total_utilisateurs) * 100) : 0}%`} subtext={`${stats.utilisateurs_affectes} comptes rattachés`} /></div>}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row"><div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"><Search size={16} className="text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par nom, matricule ou login" className="flex-1 text-sm outline-none" /></div><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"><option value="all">Tous les utilisateurs</option><option value="consultation">Consultation</option></select><span className="flex items-center gap-2 px-2 text-xs text-gray-400"><span>{filteredUsers.length} utilisateurs</span><button onClick={loadData} aria-label="Actualiser" title="Actualiser" className="hover:text-slate-800"><RefreshCw size={14} /></button></span></div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full min-w-[760px] text-left"><thead className="bg-gray-50/80"><tr>{['Nom / prénom / matricule', 'Identifiant (login AD)', 'Structure de rattachement', 'Rôle & privilèges', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{heading}</th>)}</tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id_utilisateur} className="border-t border-gray-100 hover:bg-slate-50/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">{user.nom.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><p className="text-sm font-semibold text-gray-800">{user.nom}</p><p className="text-xs text-gray-400">MAT-{String(user.id_utilisateur).padStart(5, '0')}</p></div></div></td><td className="px-4 py-3"><p className="text-sm text-gray-700">{user.login}@sonelgaz.dz</p><p className="text-xs text-gray-400">Accès réseau interne</p></td><td className="px-4 py-3"><span className="inline-flex rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">{user.nom_structure}</span></td><td className="px-4 py-3"><span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-medium ${user.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-800'}`}>{user.role === 'admin' ? 'Administrateur DSI' : 'Consultation Structure'}</span></td><td className="px-4 py-3"><div className="flex items-center gap-3 text-gray-400"><button onClick={() => { setEditingUser(user); setModalOpen(true); }} title="Modifier" aria-label="Modifier" className="hover:text-slate-900"><Edit3 size={15} /></button><button onClick={() => deleteUser(user)} title="Supprimer" aria-label="Supprimer" className="hover:text-red-600"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{filteredUsers.length === 0 && <p className="p-8 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</p>}</div>
      <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">Politique d&apos;administration : la création, modification et suppression de compte sont journalisées. L&apos;accès administrateur est réservé au personnel habilité.</p>
      <UtilisateurFormModal key={`${modalOpen}-${editingUser?.id_utilisateur || 'new'}`} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={submitUser} initialData={editingUser} structures={structures} />
    </main>
  );
}