import React, { useRef, useState } from 'react';
import { X, Download, Upload, CheckCircle2, FileText, Share2, Info } from 'lucide-react';
import { Contact } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onExportJson: () => void;
  onImportJson: (importedContacts: Contact[], mode: 'replace' | 'merge') => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  contacts,
  onClose,
  onExportJson,
  onImportJson,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [importSuccessMessage, setImportSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          onImportJson(parsed, importMode);
          setImportSuccessMessage(
            `Erfolgreich ${parsed.length} Kontakte ${importMode === 'replace' ? 'ersetzt' : 'zusammengeführt'}!`
          );
          setTimeout(() => {
            setImportSuccessMessage('');
            onClose();
          }, 1800);
        } else {
          alert('Die gewählte JSON-Datei enthält kein gültiges Kontakt-Array.');
        }
      } catch (err: any) {
        alert('Fehler beim Einlesen der JSON-Datei: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Datenverwaltung & Netzlaufwerk-Export
              </h2>
              <p className="text-xs text-slate-500">
                Kontaktdaten sichern, austauschen oder als Standalone-Anwendung bereitstellen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importSuccessMessage}</span>
          </div>
        )}

        <div className="space-y-6 pt-5">
          
          {/* Section 1: JSON Export & Import */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>JSON Datenbanksicherung ({contacts.length} Kontakte)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exportiere die Kontaktdaten als JSON-Sicherungsdatei für ein zentrales Netzlaufwerk oder importiere den aktuellen Stand von Kollegen.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              {/* Export JSON */}
              <button
                onClick={onExportJson}
                className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>JSON Exportieren</span>
              </button>

              {/* Import JSON */}
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>JSON Importieren</span>
                </button>
              </div>
            </div>

            {/* Import options */}
            <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
              <span className="font-medium text-slate-700">Import-Modus:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Zusammenführen (Erweitern)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-red-700 font-medium">Alle Ersetzen</span>
              </label>
            </div>
          </div>

          {/* Info notice */}
          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Hinweis für die Verwaltung:</strong> Die Daten werden zentral auf dem Server in der Docker-Datenbank gespeichert. Über den JSON Export/Import können Sie manuelle Backups erstellen oder Kontaktdaten importieren.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-5 mt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
