'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit, FileUp } from 'lucide-react';
import AjoutManuelConsommableTab from '@/components/AjoutManuelConsommableTab';
import ImportConsommableTab from '@/components/ImportConsommableTab';


export default function NouveauConsommablePage() {
  const [activeTab, setActiveTab] = useState('manuel');
  const router = useRouter();

  return (
    <main className="p-8">
      <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">
        Parc informatique &gt; Consommables &gt; nouveau consommable
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('manuel')}
          className={`flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-colors ${
            activeTab === 'manuel' ? 'border-slate-900 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'manuel' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <FileEdit size={18} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Ajout manuel</p>
            <p className="text-sm text-gray-700 mt-1">Saisie unitaire d&apos;un consommable ou piece detachee</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-colors ${
            activeTab === 'import' ? 'border-slate-900 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === 'import' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <FileUp size={18} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Importer un fichier (CSV / Excel)</p>
            <p className="text-sm text-gray-700 mt-1">Integration en masse avec controle de coherence</p>
          </div>
        </button>
      </div>

      {activeTab === 'manuel' ? (
        <AjoutManuelConsommableTab onSuccess={() => router.push('/consommables')} />
      ) : (
        <ImportConsommableTab onSuccess={() => router.push('/consommables')} />
      )}
    </main>
  );
}