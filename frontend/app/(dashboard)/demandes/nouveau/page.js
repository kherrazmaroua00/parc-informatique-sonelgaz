'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardCheck, CloudUpload, Info, Minus, Plus, Send, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useStoredUser } from '@/lib/useStoredUser';

const emptyLine = { id_consommable: '', quantite: 1 };

export default function NouvelleDemandePage() {
  const user = useStoredUser();
  const router = useRouter();
  const [consommables, setConsommables] = useState([]);
  const [objet, setObjet] = useState('');
  const [lignes, setLignes] = useState([{ ...emptyLine }]);
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/consommables?page=1&limit=100')
      .then((result) => setConsommables(result.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function updateLine(index, field, value) {
    setLignes((current) => current.map((line, lineIndex) => (
      lineIndex === index ? { ...line, [field]: value } : line
    )));
  }

  function addLine() {
    setLignes((current) => [...current, { ...emptyLine }]);
  }

  function removeLine(index) {
    setLignes((current) => current.length === 1 ? current : current.filter((_, lineIndex) => lineIndex !== index));
  }

  function getSelectedConsommable(line) {
    return consommables.find((consommable) => String(consommable.id_consommable) === String(line.id_consommable));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const validLines = lignes.filter((line) => line.id_consommable && Number(line.quantite) > 0);
    if (!objet.trim()) {
      setError('Veuillez renseigner l objet de la demande.');
      return;
    }
    if (validLines.length === 0) {
      setError('Ajoutez au moins un article avec une quantite valide.');
      return;
    }

    const uniqueIds = new Set(validLines.map((line) => line.id_consommable));
    if (uniqueIds.size !== validLines.length) {
      setError('Un article ne peut apparaitre qu une seule fois dans la demande.');
      return;
    }

    setSending(true);
    try {
      await apiFetch('/demandes', {
        method: 'POST',
        body: JSON.stringify({
          objet: objet.trim(),
          nom_agent: user?.nom || '',
          lignes: validLines.map((line) => ({
            id_consommable: Number(line.id_consommable),
            quantite: Number(line.quantite),
          })),
        }),
      });
      router.push('/demandes');
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1050px] p-4 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/demandes" aria-label="Retour aux demandes" className="rounded-md p-2 text-slate-500 hover:bg-white hover:text-slate-900">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Mon espace &gt; Demandes</p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Nouvelle demande de prestation de service (DPS)</h1>
          <span className="mt-2 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-900">Formulaire numerique DPS</span>
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50/80 p-3 text-xs text-slate-600">
        <Info size={15} className="mt-0.5 shrink-0 text-sky-700" />
        <p>Votre demande sera transmise directement a l administrateur DSI pour validation reglementaire et verification des stocks.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit}>
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardCheck size={17} className="text-sky-800" />
            <h2 className="text-sm font-bold text-slate-900">Demandeur</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div><p className="text-slate-500">Agent</p><p className="mt-1 font-semibold text-slate-900">{user?.nom || 'Chargement...'}</p></div>
            <div><p className="text-slate-500">Structure</p><p className="mt-1 font-semibold text-slate-900">{user?.nom_structure || 'Votre structure'}</p></div>
            <div><p className="text-slate-500">Date de la demande</p><p className="mt-1 font-semibold text-slate-900">{new Date().toLocaleDateString('fr-FR')}</p></div>
            <label className="sm:col-span-2"><span className="text-slate-500">Objet de la demande</span><input value={objet} onChange={(event) => setObjet(event.target.value)} placeholder="Ex. Dotation consommables imprimante" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20" /></label>
          </div>
        </section>

        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-2 border-b border-slate-100 pb-3">
            <CloudUpload size={18} className="mt-0.5 text-sky-800" />
            <div><h2 className="text-sm font-bold text-slate-900">Bordereau DPS papier scanne <span className="ml-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Obligatoire</span></h2><p className="mt-0.5 text-xs text-slate-500">Fiche originale numerisee comportant les visas hierarchiques</p></div>
          </div>
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center hover:border-sky-400 hover:bg-sky-50/40">
            <span className="mb-2 rounded-md bg-sky-100 p-2 text-sky-800"><CloudUpload size={18} /></span>
            <span className="text-xs font-semibold text-slate-900">Cliquez pour televerser ou glissez-deposez un nouveau scan</span>
            <span className="mt-1 text-[11px] text-slate-500">Formats acceptes : PDF, PNG, JPG (poids maximal : 10 Mo)</span>
            {documentName && <span className="mt-2 text-xs font-semibold text-emerald-700">{documentName}</span>}
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => setDocumentName(event.target.files?.[0]?.name || '')} />
          </label>
          <p className="mt-3 text-center text-[11px] text-slate-500">Veillez a ce que le cachet rond Sonelgaz et le visa de division soient bien lisibles.</p>
        </section>

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-900">Articles demandes (optionnel)</h2><span className="text-xs text-slate-500">{lignes.length} article{lignes.length > 1 ? 's' : ''}</span></div>
          <div className="space-y-2">
            {lignes.map((line, index) => (
              <div key={`${index}-${line.id_consommable}`} className="grid grid-cols-1 gap-2 rounded-md bg-slate-50 p-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <div className="min-w-0">
                  <select value={line.id_consommable} onChange={(event) => updateLine(index, 'id_consommable', event.target.value)} disabled={loading} className="w-full min-w-0 rounded border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-sky-700">
                  <option value="">Selectionner un consommable</option>
                  {consommables.map((consommable) => <option key={consommable.id_consommable} value={consommable.id_consommable}>{consommable.designation} | Stock : {consommable.quantite_stock}</option>)}
                  </select>
                  {getSelectedConsommable(line) && <p className={`mt-1 truncate text-[11px] ${getSelectedConsommable(line).quantite_stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{getSelectedConsommable(line).type_consommable || 'Consommable'} · {getSelectedConsommable(line).quantite_stock > 0 ? `${getSelectedConsommable(line).quantite_stock} disponible(s)` : 'Rupture de stock'}</p>}
                </div>
                <div className="flex items-center gap-2 sm:contents">
                  <button type="button" onClick={() => updateLine(index, 'quantite', Math.max(1, Number(line.quantite) - 1))} className="rounded border border-slate-200 bg-white px-2 py-2 text-slate-600 hover:bg-slate-100" aria-label="Diminuer la quantite"><Minus size={13} /></button>
                  <input type="number" min="1" value={line.quantite} onChange={(event) => updateLine(index, 'quantite', event.target.value)} className="w-16 rounded border border-slate-200 bg-white py-2 text-center text-sm text-slate-900 outline-none focus:border-sky-700" aria-label="Quantite" />
                  <div className="flex gap-1"><button type="button" onClick={() => updateLine(index, 'quantite', Number(line.quantite) + 1)} className="rounded border border-slate-200 bg-white px-2 py-2 text-slate-600 hover:bg-slate-100" aria-label="Augmenter la quantite"><Plus size={13} /></button><button type="button" onClick={() => removeLine(index)} className="rounded border border-slate-200 bg-white px-2 py-2 text-slate-500 hover:text-red-600" aria-label="Supprimer la ligne"><Trash2 size={13} /></button></div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLine} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-200"><Plus size={14} /> Ajouter un article</button>
        </section>

        <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center"><Link href="/demandes" className="text-center text-xs font-medium text-slate-600 hover:text-slate-900 sm:text-left">Annuler</Link><button type="submit" disabled={sending || !user} className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} /> {sending ? 'Envoi...' : 'Envoyer la demande'}</button></div>
        <p className="mt-4 text-center text-[11px] text-slate-500">Les articles seront remis au magasin central apres approbation.</p>
      </form>
    </main>
  );
}
