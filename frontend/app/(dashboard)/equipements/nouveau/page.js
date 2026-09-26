'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit, FileUp } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import AjoutManuelTab from '@/components/AjoutManuelTab';
import ImportFichierTab from '@/components/ImportFichierTab';


export default function NouvelEquipementPage() {
  const [activeTab, setActiveTab] = useState('manuel');
  const [types, setTypes] = useState([]);
  const [structures, setStructures] = useState([]);
  const router = useRouter();

  useEffect(() => {
    apiFetch('/types').then(setTypes).catch(() => {});
    apiFetch('/structures').then(setStructures).catch(() => {});
  }, []);

  return (
    <main className="p-8">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        Parc informatique &gt; Equipements &gt; nouveau materiel
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('manuel')}
          className={`flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-colors ${
            activeTab === 'manuel'
              ? 'border-slate-900 bg-white'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'manuel' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <FileEdit size={18} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              Ajout manuel
              <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                FORMULAIRE DIRECT
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Saisie unitaire assistee par douchette optique &amp; normalisation
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-colors ${
            activeTab === 'import'
              ? 'border-slate-900 bg-white'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'import' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <FileUp size={18} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              Importer un fichier (CSV / Excel)
              <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                IMPORT PAR LOT
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Integration matricielle en masse avec controle de coherence DSI
            </p>
          </div>
        </button>
      </div>

      {activeTab === 'manuel' ? (
        <AjoutManuelTab
          types={types}
          structures={structures}
          onSuccess={() => router.push('/equipements')}
        />
      ) : (
        <ImportFichierTab
          structures={structures}
          onSuccess={() => router.push('/equipements')}
        />
      )}
    </main>
  );
}