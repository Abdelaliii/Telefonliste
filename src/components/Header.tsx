import React from 'react';
import { 
  Building2, 
  UserPlus, 
  FileDown, 
  Printer, 
  Building,
  Users,
  SlidersHorizontal,
  Lock,
  Unlock
} from 'lucide-react';

interface HeaderProps {
  totalContacts: number;
  locationsCount: number;
  isUnlocked: boolean;
  onToggleLock: () => void;
  onOpenAddModal: () => void;
  onOpenMasterDataModal: () => void;
  onOpenImportExportModal: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalContacts,
  locationsCount,
  isUnlocked,
  onToggleLock,
  onOpenAddModal,
  onOpenMasterDataModal,
  onOpenImportExportModal,
  onPrint,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <img src="/logo.jpg" alt="Systeex Logo" className="h-9 sm:h-11 w-auto rounded bg-white px-2 py-1" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Telefon- & Kontaktverzeichnis
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Verwaltung
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <strong className="text-slate-200 font-semibold">{totalContacts}</strong> Kontakte
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-slate-200 font-semibold">{locationsCount}</strong> Standorte
                </span>
                <span className="hidden md:inline text-slate-600">•</span>
                <span className="hidden md:inline text-slate-400">
                  Zentrale Server-Datenhaltung
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Lock/Unlock Mode Button */}
            <button
              onClick={onToggleLock}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 shadow-md ring-1 ${
                isUnlocked
                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 ring-slate-700/30'
              }`}
              id="btn-toggle-lock"
              title={isUnlocked ? 'Bearbeitungsmodus sperren' : 'Bearbeitungsmodus mit Passwort freischalten'}
            >
              {isUnlocked ? (
                <>
                  <Unlock className="w-4 h-4 text-amber-200" />
                  <span>Berechtigung aktiv (Sperren)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Bearbeiten freischalten</span>
                </>
              )}
            </button>

            {isUnlocked && (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 shadow-md shadow-blue-900/20 ring-1 ring-blue-500/30 animate-in fade-in duration-200"
                  id="btn-new-contact"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Neuer Kontakt</span>
                </button>

                <button
                  onClick={onOpenMasterDataModal}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 shadow-md shadow-indigo-900/20 ring-1 ring-indigo-500/30 animate-in fade-in duration-200"
                  id="btn-master-data"
                  title="Stammdaten (Standorte & Abteilungen) verwalten"
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-200" />
                  <span>Stammdaten verwalten</span>
                </button>

                <button
                  onClick={onOpenImportExportModal}
                  className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 animate-in fade-in duration-200"
                  title="JSON Importieren / Exportieren"
                  id="btn-import-export"
                >
                  <FileDown className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">JSON Import/Export</span>
                </button>
              </>
            )}

            <button
              onClick={onPrint}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5"
              title="Druckansicht öffnen"
              id="btn-print"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Drucken</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
