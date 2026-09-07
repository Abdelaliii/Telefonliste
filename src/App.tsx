import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ContactTable } from './components/ContactTable';
import { ContactGrid } from './components/ContactGrid';
import { ContactGrouped } from './components/ContactGrouped';
import { ContactModal } from './components/ContactModal';
import { ImportExportModal } from './components/ImportExportModal';
import { VCardModal } from './components/VCardModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { MasterDataModal } from './components/MasterDataModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Contact, FilterState, ViewMode, SortField, SortOrder } from './types';
import { loadContactsFromStorage, exportContactsToJson } from './lib/storage';
import { loadMasterStandorte, loadMasterAbteilungen } from './lib/masterData';
import {
  fetchContactsApi,
  saveContactApi,
  deleteContactApi,
  resetContactsApi,
  fetchMasterDataApi,
  saveStandorteApi,
  saveAbteilungenApi,
  importContactsApi
} from './lib/api';
import { Contact as ContactIcon, Plus, Building2, Database, RefreshCw } from 'lucide-react';

export default function App() {
  // Lock / unlock mode state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPastExits, setShowPastExits] = useState(true);
  const [showFutureEntries, setShowFutureEntries] = useState(true);

  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>(() => loadContactsFromStorage());

  // Master Data State (Standorte & Abteilungen)
  const [masterStandorte, setMasterStandorte] = useState<string[]>(() => loadMasterStandorte());
  const [masterAbteilungen, setMasterAbteilungen] = useState<string[]>(() => loadMasterAbteilungen());
  const [isMasterDataModalOpen, setIsMasterDataModalOpen] = useState(false);

  // Server Connection Status
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('nachname');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedStandort: '',
    selectedAbteilung: '',
    onlyFavorites: false,
    alphabetFilter: '',
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [vCardContact, setVCardContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  // Add toast helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync / Fetch function from API
  const syncWithServer = useCallback(async (showToastNotice = false) => {
    setIsRefreshing(true);
    const contactsRes = await fetchContactsApi();
    const masterRes = await fetchMasterDataApi();

    setContacts(contactsRes.contacts);
    setMasterStandorte(masterRes.standorte);
    setMasterAbteilungen(masterRes.abteilungen);
    setIsServerConnected(contactsRes.isServerConnected);
    setIsRefreshing(false);

    if (showToastNotice) {
      if (contactsRes.isServerConnected) {
        addToast('Daten erfolgreich mit zentralem Server synchronisiert.', 'success');
      } else {
        addToast('Server aktuell nicht erreichbar. Lokale Daten geladen.', 'info');
      }
    }
  }, []);

  // Initial load and periodic poll for multi-user synchronization
  useEffect(() => {
    syncWithServer(false);

    // Poll every 8 seconds for multi-user sync
    const interval = setInterval(() => {
      syncWithServer(false);
    }, 8000);

    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Master Data Handlers
  const handleAddStandort = async (name: string) => {
    if (masterStandorte.includes(name)) {
      addToast(`Standort "${name}" existiert bereits in den Stammdaten.`, 'info');
      return;
    }
    const newList = [...masterStandorte, name].sort();
    setMasterStandorte(newList);
    await saveStandorteApi(newList);
    addToast(`Standort "${name}" zu Stammdaten hinzugefügt.`);
  };

  const handleUpdateStandort = async (oldName: string, newName: string) => {
    const newList = masterStandorte.map((s) => (s === oldName ? newName : s)).sort();
    setMasterStandorte(newList);
    const updatedContacts = contacts.map((c) => (c.standort === oldName ? { ...c, standort: newName } : c));
    setContacts(updatedContacts);
    
    await saveStandorteApi(newList);
    await saveContactApi({ ...updatedContacts[0] }); // trigger save
    addToast(`Standort "${oldName}" in "${newName}" umbenannt.`);
  };

  const handleDeleteStandort = async (name: string) => {
    const newList = masterStandorte.filter((s) => s !== name);
    setMasterStandorte(newList);
    await saveStandorteApi(newList);
    addToast(`Standort "${name}" aus Stammdaten entfernt.`, 'info');
  };

  const handleAddAbteilung = async (name: string) => {
    if (masterAbteilungen.includes(name)) {
      addToast(`Abteilung "${name}" existiert bereits in den Stammdaten.`, 'info');
      return;
    }
    const newList = [...masterAbteilungen, name].sort();
    setMasterAbteilungen(newList);
    await saveAbteilungenApi(newList);
    addToast(`Abteilung "${name}" zu Stammdaten hinzugefügt.`);
  };

  const handleUpdateAbteilung = async (oldName: string, newName: string) => {
    const newList = masterAbteilungen.map((a) => (a === oldName ? newName : a)).sort();
    setMasterAbteilungen(newList);
    const updatedContacts = contacts.map((c) => (c.abteilung === oldName ? { ...c, abteilung: newName } : c));
    setContacts(updatedContacts);

    await saveAbteilungenApi(newList);
    addToast(`Abteilung "${oldName}" in "${newName}" umbenannt.`);
  };

  const handleDeleteAbteilung = async (name: string) => {
    const newList = masterAbteilungen.filter((a) => a !== name);
    setMasterAbteilungen(newList);
    await saveAbteilungenApi(newList);
    addToast(`Abteilung "${name}" aus Stammdaten entfernt.`, 'info');
  };

  // Extract unique locations and departments (combining master data and contacts)
  const allStandorte = useMemo(() => {
    const set = new Set<string>([...masterStandorte]);
    contacts.forEach((c) => {
      if (c.standort) set.add(c.standort);
    });
    return Array.from(set).sort();
  }, [contacts, masterStandorte]);

  const allAbteilungen = useMemo(() => {
    const set = new Set<string>([...masterAbteilungen]);
    contacts.forEach((c) => {
      if (c.abteilung) set.add(c.abteilung);
    });
    return Array.from(set).sort();
  }, [contacts, masterAbteilungen]);

  // Filter & Sort Logic
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    // Filter by Eintritt/Austritt date rules
    const todayYMD = (() => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();

    const normalizeDateToYMD = (dateStr?: string): string | null => {
      if (!dateStr || !dateStr.trim()) return null;
      const str = dateStr.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
      const match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
      return null;
    };

    result = result.filter((c) => {
      const austrittYMD = normalizeDateToYMD(c.austrittDatum);
      const eintrittYMD = normalizeDateToYMD(c.eintrittDatum);

      if (!isUnlocked) {
        // User view: Always hide past exits and future entries
        if (austrittYMD && austrittYMD < todayYMD) return false;
        if (eintrittYMD && eintrittYMD > todayYMD) return false;
      } else {
        // Admin view: Respect Admin toggle options
        if (!showPastExits && austrittYMD && austrittYMD < todayYMD) return false;
        if (!showFutureEntries && eintrittYMD && eintrittYMD > todayYMD) return false;
      }

      return true;
    });

    // Filter by Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const fullName = `${c.nachname} ${c.vorname}`.toLowerCase();
        const reverseName = `${c.vorname} ${c.nachname}`.toLowerCase();
        return (
          fullName.includes(q) ||
          reverseName.includes(q) ||
          (c.position || '').toLowerCase().includes(q) ||
          (c.abteilung || '').toLowerCase().includes(q) ||
          (c.standort || '').toLowerCase().includes(q) ||
          (c.festnetz || '').toLowerCase().includes(q) ||
          (c.mobil || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.raum || '').toLowerCase().includes(q) ||
          (c.notizen || '').toLowerCase().includes(q)
        );
      });
    }

    // Filter by Location
    if (filters.selectedStandort) {
      result = result.filter((c) => c.standort === filters.selectedStandort);
    }

    // Filter by Department
    if (filters.selectedAbteilung) {
      result = result.filter((c) => c.abteilung === filters.selectedAbteilung);
    }

    // Filter by Favorites
    if (filters.onlyFavorites) {
      result = result.filter((c) => c.isFavorite);
    }

    // Filter by Initial Letter
    if (filters.alphabetFilter) {
      const char = filters.alphabetFilter.toUpperCase();
      result = result.filter((c) => c.nachname.toUpperCase().startsWith(char));
    }

    // Sort Result
    result.sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [contacts, filters, sortField, sortOrder, isUnlocked, showPastExits, showFutureEntries]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedStandort: '',
      selectedAbteilung: '',
      onlyFavorites: false,
      alphabetFilter: '',
    });
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id'> & { id?: string }) => {
    const res = await saveContactApi(contactData);
    setContacts(res.contacts);
    setIsServerConnected(res.isServerConnected);

    addToast(
      contactData.id
        ? `Kontakt ${contactData.nachname}, ${contactData.vorname} erfolgreich aktualisiert.`
        : `Kontakt ${contactData.nachname}, ${contactData.vorname} neu angelegt.`
    );
    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteConfirm = async (id: string) => {
    const target = contacts.find((c) => c.id === id);
    const res = await deleteContactApi(id);
    setContacts(res.contacts);
    setIsServerConnected(res.isServerConnected);

    setDeletingContact(null);
    if (target) {
      addToast(`Kontakt ${target.nachname}, ${target.vorname} gelöscht.`, 'info');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const target = contacts.find((c) => c.id === id);
    if (!target) return;

    const updatedContact = { ...target, isFavorite: !target.isFavorite };
    const res = await saveContactApi(updatedContact);
    setContacts(res.contacts);

    addToast(
      updatedContact.isFavorite
        ? `${target.nachname} zu Favoriten hinzugefügt.`
        : `${target.nachname} aus Favoriten entfernt.`,
      'info'
    );
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} in Zwischenablage kopiert!`);
  };

  const handleToggleLock = () => {
    if (isUnlocked) {
      setIsUnlocked(false);
      addToast('Bearbeitungsmodus gesperrt.', 'info');
    } else {
      const password = window.prompt('Bitte geben Sie das Passwort ein, um den Bearbeitungsmodus freizuschalten:');
      if (password === 'Telefonliste2026!+#') {
        setIsUnlocked(true);
        addToast('Bearbeitungsmodus erfolgreich freigeschaltet.', 'success');
      } else if (password !== null) {
        addToast('Falsches Passwort!', 'error');
      }
    }
  };

  const handleExportJson = () => {
    const backupData = {
      contacts,
      standorte: masterStandorte,
      abteilungen: masterAbteilungen
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Telefonliste_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(`${contacts.length} Kontakte und Stammdaten als JSON gesichert.`);
  };

  const handleImportJson = async (importData: any, mode: 'replace' | 'merge') => {
    let importedContacts: Contact[] = [];
    let importedStandorte: string[] = [];
    let importedAbteilungen: string[] = [];

    if (Array.isArray(importData)) {
      importedContacts = importData;
    } else if (importData && typeof importData === 'object') {
      importedContacts = importData.contacts || [];
      importedStandorte = importData.standorte || [];
      importedAbteilungen = importData.abteilungen || [];
    }

    // 1. Import contacts
    const res = await importContactsApi(importedContacts, mode);
    setContacts(res.contacts);
    setIsServerConnected(res.isServerConnected);

    // 2. Import Master Data if present in backup file
    if (importedStandorte.length > 0 || importedAbteilungen.length > 0) {
      if (mode === 'replace') {
        if (importedStandorte.length > 0) {
          setMasterStandorte(importedStandorte);
          await saveStandorteApi(importedStandorte);
        }
        if (importedAbteilungen.length > 0) {
          setMasterAbteilungen(importedAbteilungen);
          await saveAbteilungenApi(importedAbteilungen);
        }
      } else {
        if (importedStandorte.length > 0) {
          const mergedStandorte = Array.from(new Set([...masterStandorte, ...importedStandorte])).sort();
          setMasterStandorte(mergedStandorte);
          await saveStandorteApi(mergedStandorte);
        }
        if (importedAbteilungen.length > 0) {
          const mergedAbteilungen = Array.from(new Set([...masterAbteilungen, ...importedAbteilungen])).sort();
          setMasterAbteilungen(mergedAbteilungen);
          await saveAbteilungenApi(mergedAbteilungen);
        }
      }
    }

    addToast(`${importedContacts.length} Kontakte und Stammdaten erfolgreich importiert.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Printable Header - Visible ONLY when printing */}
      <div className="hidden print:block p-4 border-b border-slate-300 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Systeex Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-black">Telefon- und Kontaktverzeichnis</h1>
              <p className="text-xs text-slate-600">Systeex · Verwaltungsausgabe · Stand: {new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            Gesamt: {contacts.length} Kontakte
          </div>
        </div>
      </div>

      {/* Main App Header */}
      <Header
        totalContacts={contacts.length}
        locationsCount={allStandorte.length}
        isUnlocked={isUnlocked}
        onToggleLock={handleToggleLock}
        onOpenAddModal={() => {
          setEditingContact(null);
          setIsContactModalOpen(true);
        }}
        onOpenMasterDataModal={() => setIsMasterDataModalOpen(true)}
        onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
        onPrint={handlePrint}
      />

      {/* Server Status Banner */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-2 text-xs text-slate-300 flex flex-wrap justify-between items-center gap-2 no-print">
        <div className="flex items-center gap-2">
          {isServerConnected ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-sm shadow-emerald-400/50"></span>
              <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Zentrale Server-Datenbank aktiv (Multi-User Synchro)
              </span>
              <span className="text-slate-500 text-[11px] hidden md:inline">
                · Alle Mitarbeiter greifen auf dieselben Live-Kontakte zu
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span className="font-medium text-amber-300">
                Lokaler Browser-Modus (Offline-Fallback)
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                · Keine Verbindung zum zentralen Docker-Server
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => syncWithServer(true)}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700"
            title="Jetzt manuell mit Server synchronisieren"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isRefreshing ? 'Aktualisiere...' : 'Synchro prüfen'}</span>
          </button>
          <span className="text-slate-500 text-[11px]">Auto-Refresh: 8s</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Search & Filter Bar */}
        <SearchAndFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          allStandorte={allStandorte}
          allAbteilungen={allAbteilungen}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredAndSortedContacts.length}
          totalCount={contacts.length}
          onResetFilters={handleResetFilters}
          isUnlocked={isUnlocked}
          showPastExits={showPastExits}
          showFutureEntries={showFutureEntries}
          onTogglePastExits={setShowPastExits}
          onToggleFutureEntries={setShowFutureEntries}
        />

        {/* Content Display (Table / Cards / Grouped / Empty State) */}
        {filteredAndSortedContacts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm my-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ContactIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Keine Kontakte gefunden</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {contacts.length === 0
                ? 'Es befinden sich aktuell keine Kontakte im Verzeichnis.'
                : 'Es gibt keine Treffer für deine ausgewählten Suchkriterien oder Filter.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              {contacts.length > 0 ? (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Filter zurücksetzen
                </button>
              ) : null}
              {isUnlocked && (
                <button
                  onClick={() => {
                    setEditingContact(null);
                    setIsContactModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neuen Kontakt anlegen</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <ContactTable
                contacts={filteredAndSortedContacts}
                sortField={sortField}
                sortOrder={sortOrder}
                isUnlocked={isUnlocked}
                onSort={handleSort}
                onEdit={(contact) => {
                  setEditingContact(contact);
                  setIsContactModalOpen(true);
                }}
                onDelete={(contact) => setDeletingContact(contact)}
                onToggleFavorite={handleToggleFavorite}
                onOpenVCard={(contact) => setVCardContact(contact)}
                onCopy={handleCopy}
              />
            )}

            {viewMode === 'cards' && (
              <ContactGrid
                contacts={filteredAndSortedContacts}
                isUnlocked={isUnlocked}
                onEdit={(contact) => {
                  setEditingContact(contact);
                  setIsContactModalOpen(true);
                }}
                onDelete={(contact) => setDeletingContact(contact)}
                onToggleFavorite={handleToggleFavorite}
                onOpenVCard={(contact) => setVCardContact(contact)}
                onCopy={handleCopy}
              />
            )}

            {viewMode === 'grouped' && (
              <ContactGrouped
                contacts={filteredAndSortedContacts}
                isUnlocked={isUnlocked}
                onEdit={(contact) => {
                  setEditingContact(contact);
                  setIsContactModalOpen(true);
                }}
                onDelete={(contact) => setDeletingContact(contact)}
                onToggleFavorite={handleToggleFavorite}
                onOpenVCard={(contact) => setVCardContact(contact)}
                onCopy={handleCopy}
              />
            )}
          </>
        )}

      </main>

      {/* Status Bar */}
      <div className="bg-slate-100/90 border-t border-slate-200/80 px-4 sm:px-6 py-2 text-xs text-slate-500 flex justify-between items-center no-print">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block ${isServerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span>
            {isServerConnected
              ? 'System bereit · Speicherung im zentralen Server-Ordner (/app/data/contacts.json)'
              : 'System bereit · Speicherung im lokalen Browser-Speicher'}
          </span>
        </div>
        <div className="font-medium text-slate-600">
          Gefiltert: <strong className="text-slate-900">{filteredAndSortedContacts.length}</strong> von <strong className="text-slate-900">{contacts.length}</strong> Kontakten
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Telefon- und Kontaktverzeichnis · Digitale Verwaltungslösung</span>
          </div>
          <div>
            Docker & Portainer ready · Zentrale Datenhaltung für Teams
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        editingContact={editingContact}
        allStandorte={allStandorte}
        allAbteilungen={allAbteilungen}
        onClose={() => {
          setIsContactModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        contacts={contacts}
        onClose={() => setIsImportExportModalOpen(false)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      <VCardModal
        contact={vCardContact}
        onClose={() => setVCardContact(null)}
        onCopy={handleCopy}
      />

      <DeleteConfirmModal
        contact={deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDeleteConfirm}
      />

      <MasterDataModal
        isOpen={isMasterDataModalOpen}
        standorte={masterStandorte}
        abteilungen={masterAbteilungen}
        onClose={() => setIsMasterDataModalOpen(false)}
        onAddStandort={handleAddStandort}
        onUpdateStandort={handleUpdateStandort}
        onDeleteStandort={handleDeleteStandort}
        onAddAbteilung={handleAddAbteilung}
        onUpdateAbteilung={handleUpdateAbteilung}
        onDeleteAbteilung={handleDeleteAbteilung}
      />

    </div>
  );
}
