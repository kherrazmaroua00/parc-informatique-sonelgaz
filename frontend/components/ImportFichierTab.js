'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const etatLabels = { actif: 'Actif', en_panne: 'En panne', defectueux: 'Defectueux', reforme: 'Reforme' };

export default function ImportFichierTab({ structures, onSuccess }) {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleDownloadTemplate() {
    const headers = ['code_barre', 'designation', 'marque', 'reference', 'numero_serie', 'type', 'structure', 'etat', 'annee_mise_en_service'];
    const example = ['SNL-SAI-PC-0200', 'PC HP ProDesk 400 G6', 'HP', 'ProDesk 400 G6', 'SN000200', 'PC', 'DRC', 'actif', '2024'];
    const csvContent = [headers, example].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele_import_equipements.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedRows = results.data.map((r) => ({
          code_barre: r.code_barre?.trim() || '',
          designation: r.designation?.trim() || '',
          marque: r.marque?.trim() || '',
          reference: r.reference?.trim() || '',
          numero_serie: r.numero_serie?.trim() || '',
          type: r.type?.trim() || '',
          structure: r.structure?.trim() || '',
          etat: r.etat?.trim() || 'actif',
          annee_mise_en_service: r.annee_mise_en_service?.trim() || '',
        }));

        setValidating(true);
        try {
          const validated = await apiFetch('/equipements/batch/validate', {
            method: 'POST',
            body: JSON.stringify({ rows: parsedRows }),
          });
          setRows(validated);
        } catch (err) {
          setError(err.message);
        } finally {
          setValidating(false);
        }
      },
      error: (err) => setError('Erreur de lecture du fichier: ' + err.message),
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  async function handleImport() {
    setImporting(true);
    setError('');
    try {
      const result = await apiFetch('/equipements/batch/import', {
        method: 'POST',
        body: JSON.stringify({ rows }),
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">Importation par Lot (CSV / Excel)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Procedure normalisee pour dotations volumineuses de districts et agences
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
          >
            <Download size={14} strokeWidth={1.75} />
            Telecharger le modele (CSV)
          </button>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center transition-colors ${
            dragOver ? 'border-slate-800 bg-slate-50' : 'border-gray-200'
          }`}
        >
          <UploadCloud size={36} className="text-blue-400 mb-3" strokeWidth={1.5} />
          <p className="font-semibold text-gray-900 text-sm">Glissez-deposez votre fichier ici</p>
          <p className="text-sm text-gray-500 mt-1">
            ou{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 underline font-medium"
            >
              cliquez pour parcourir vos dossiers
            </button>
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Formats supportes : .CSV &nbsp;•&nbsp; Taille maximale : 25 Mo &nbsp;•&nbsp; Jeu de caracteres : UTF-8
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>

      {validating && (
        <p className="text-sm text-gray-500 text-center">Validation en cours...</p>
      )}

      {rows.length > 0 && !validating && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-gray-900">Fichier detecte : {fileName}</span>
              <span className="flex items-center gap-1 text-emerald-600 text-xs">
                <CheckCircle2 size={13} strokeWidth={1.75} /> {validCount} lignes valides
              </span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle size={13} strokeWidth={1.75} /> {invalidCount} anomalies
                </span>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={validCount === 0 || importing}
              className="flex items-center gap-2 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              <UploadCloud size={15} strokeWidth={1.75} />
              {importing ? 'Import en cours...' : `Importer ${validCount} equipements valides`}
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Code-barres</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Designation</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Marque</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Structure</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Etat</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase">Statut import</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-t border-gray-100 ${!row.valid ? 'bg-red-50/40' : ''}`}>
                  <td className={`py-2.5 px-4 font-mono text-xs ${!row.valid ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                    {row.code_barre || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-gray-700">{row.designation || '-'}</td>
                  <td className="py-2.5 px-4 text-gray-600">{row.marque || '-'}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{row.type || '-'}</span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">{row.structure || '-'}</td>
                  <td className="py-2.5 px-4 text-gray-600">{etatLabels[row.etat] || row.etat}</td>
                  <td className="py-2.5 px-4">
                    {row.valid ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 size={13} strokeWidth={1.75} /> Conforme
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600" title={row.issues.join(', ')}>
                        {row.issues[0]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            * Les lignes presentant des anomalies sont automatiquement isolees pour correction sans bloquer l'importation des equipements valides.
          </p>
        </div>
      )}
    </div>
  );
}