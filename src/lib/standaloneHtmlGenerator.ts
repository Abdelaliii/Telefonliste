import { Contact } from '../types';
import { STANDORTE_INITIAL, ABTEILUNGEN_INITIAL } from '../data/initialContacts';

export function generateStandaloneHtml(contacts: Contact[], title = 'Telefon- und Kontaktverzeichnis'): string {
  const jsonContacts = JSON.stringify(contacts, null, 2);
  const jsonStandorte = JSON.stringify(STANDORTE_INITIAL, null, 2);
  const jsonAbteilungen = JSON.stringify(ABTEILUNGEN_INITIAL, null, 2);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; padding: 0 !important; }
      .print-shadow-none { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
      .page-break-inside-avoid { break-inside: avoid; }
    }
    /* Hide scrollbar for clean UI */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen antialiased flex flex-col font-sans">

  <!-- Header -->
  <header class="bg-slate-900 text-white shadow-lg no-print border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <!-- Title & Stats Badges -->
        <div class="flex items-center gap-3.5">
          <div class="p-3 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-900/30">
            <i class="fa-solid fa-address-book text-2xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold tracking-tight text-white">${title}</h1>
              <span class="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Standalone
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Digitale Verwaltungsausgabe · Offline & Lokal im Browser speicherbar</p>
            
            <!-- Quick Stats Row -->
            <div class="flex items-center gap-3 mt-2 text-xs">
              <span class="inline-flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <i class="fa-solid fa-users text-blue-400"></i>
                <strong id="statTotalContacts" class="text-white">0</strong> Kontakte
              </span>
              <span class="inline-flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <i class="fa-solid fa-building text-amber-400"></i>
                <strong id="statLocations" class="text-white">0</strong> Standorte
              </span>
              <span class="inline-flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <i class="fa-solid fa-sitemap text-emerald-400"></i>
                <strong id="statDepartments" class="text-white">0</strong> Abteilungen
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons Bar -->
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="openModal()" class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-900/30">
            <i class="fa-solid fa-user-plus"></i> Neuer Kontakt
          </button>
          
          <button onclick="openMasterModal()" class="bg-indigo-700 hover:bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-md shadow-indigo-900/20">
            <i class="fa-solid fa-sliders text-indigo-200"></i> Stammdaten verwalten
          </button>

          <button onclick="openImportExportModal()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5">
            <i class="fa-solid fa-arrows-rotate text-blue-400"></i> Import / Export
          </button>

          <button onclick="window.print()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5">
            <i class="fa-solid fa-print"></i> Drucken
          </button>

          <button onclick="resetSampleData()" class="bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 p-2 rounded-xl text-xs transition flex items-center gap-1" title="Vollständige PDF-Kontaktdaten wiederherstellen">
            <i class="fa-solid fa-rotate-left"></i>
            <span class="hidden md:inline text-[11px]">PDF-Reset</span>
          </button>
        </div>

      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
    
    <!-- Controls & Filters Container -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-6 space-y-4 no-print">
      
      <!-- Search + Dropdowns + View Switcher Row -->
      <div class="flex flex-col lg:flex-row gap-3">
        
        <!-- Search Input -->
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400"></i>
          <input 
            type="text" 
            id="searchInput" 
            oninput="render()" 
            placeholder="Live-Suche nach Name, Abteilung, Position, Telefon, Email, Raum..." 
            class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition"
          >
          <button id="btnClearSearch" onclick="clearSearch()" class="hidden absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Location Dropdown -->
        <div class="relative min-w-[200px]">
          <i class="fa-solid fa-location-dot absolute left-3.5 top-3.5 text-slate-400 pointer-events-none"></i>
          <select 
            id="locationSelect" 
            onchange="render()" 
            class="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition appearance-none cursor-pointer"
          >
            <option value="">Alle Standorte</option>
          </select>
        </div>

        <!-- Department Dropdown -->
        <div class="relative min-w-[200px]">
          <i class="fa-solid fa-building absolute left-3.5 top-3.5 text-slate-400 pointer-events-none"></i>
          <select 
            id="departmentSelect" 
            onchange="render()" 
            class="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition appearance-none cursor-pointer"
          >
            <option value="">Alle Abteilungen</option>
          </select>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 shrink-0 self-start lg:self-auto">
          <button 
            id="btnViewTable" 
            onclick="setViewMode('table')" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-white text-slate-900 shadow-sm border border-slate-200"
            title="Tabellenansicht"
          >
            <i class="fa-solid fa-list text-slate-600"></i>
            <span class="hidden sm:inline">Tabelle</span>
          </button>

          <button 
            id="btnViewCards" 
            onclick="setViewMode('cards')" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900"
            title="Kartenansicht"
          >
            <i class="fa-solid fa-border-all text-slate-600"></i>
            <span class="hidden sm:inline">Karten</span>
          </button>

          <button 
            id="btnViewGrouped" 
            onclick="setViewMode('grouped')" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900"
            title="Gruppiert nach Standort"
          >
            <i class="fa-solid fa-layer-group text-slate-600"></i>
            <span class="hidden sm:inline">Gruppiert</span>
          </button>
        </div>

      </div>

      <!-- Quick Standort Pills + Favorites Filter Bar -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-3 text-xs">
        <span class="text-slate-400 font-medium mr-1 shrink-0">Standort:</span>
        <div id="standortPillsContainer" class="flex items-center gap-1.5 shrink-0"></div>

        <div class="ml-auto flex items-center gap-2 shrink-0">
          <button 
            id="btnFavoriteFilter" 
            onclick="toggleOnlyFavoritesFilter()" 
            class="flex items-center gap-1 px-3 py-1 rounded-full font-medium transition border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          >
            <i id="starFilterIcon" class="fa-regular fa-star text-slate-400"></i>
            <span>Favoriten</span>
          </button>
        </div>
      </div>

      <!-- A-Z Alphabet Quick Jumper Bar -->
      <div class="flex items-center gap-1 overflow-x-auto pb-1 text-xs pt-2 border-t border-slate-100 no-scrollbar">
        <span class="text-slate-400 font-medium mr-1 shrink-0">A-Z:</span>
        <div id="alphabetContainer" class="flex items-center gap-1 shrink-0"></div>
      </div>

      <!-- Bottom Info Row -->
      <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div id="counterText">
          Zeige <strong class="text-slate-800 font-semibold">0</strong> Kontakten
        </div>

        <button 
          id="btnResetFilters" 
          onclick="resetFilters()" 
          class="hidden text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
        >
          <i class="fa-solid fa-rotate-left text-xs"></i> Filter zurücksetzen
        </button>
      </div>

    </div>

    <!-- Contact List Container -->
    <div id="contactContainer"></div>

  </main>

  <!-- Contact Form Modal (Add / Edit) -->
  <div id="modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden no-print p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <i class="fa-solid fa-user-gear"></i>
          </div>
          <h3 id="modalTitle" class="text-lg font-bold text-slate-900">Kontakt hinzufügen</h3>
        </div>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <form id="contactForm" onsubmit="saveContact(event)" class="space-y-4 pt-4">
        <input type="hidden" id="editId">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Vorname *</label>
            <input type="text" id="inputVorname" required placeholder="Vorname" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nachname *</label>
            <input type="text" id="inputNachname" required placeholder="Nachname" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Standort *</label>
          <input type="text" id="inputStandort" required list="standorteList" placeholder="z. B. Rathaus Hauptgebäude" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          <datalist id="standorteList"></datalist>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Position / Rolle *</label>
            <input type="text" id="inputPosition" required placeholder="z. B. Sachbearbeiter" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Abteilung *</label>
            <input type="text" id="inputAbteilung" required list="abteilungenList" placeholder="z. B. Bürgerbüro" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <datalist id="abteilungenList"></datalist>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Festnetznummer *</label>
            <input type="text" id="inputFestnetz" required placeholder="0221 500-123" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Mobilnummer (optional)</label>
            <input type="text" id="inputMobil" placeholder="0171 1234567" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Email-Adresse *</label>
            <input type="email" id="inputEmail" required placeholder="name@verwaltung.de" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Raum / Büro</label>
            <input type="text" id="inputRaum" placeholder="Raum 101" class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Notizen / Erreichbarkeit</label>
          <textarea id="inputNotizen" rows="2" placeholder="Zusätzliche Hinweise..." class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Abbrechen</button>
          <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-sm transition">Speichern</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Master Data Modal -->
  <div id="masterModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden no-print p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
      <div class="flex justify-between items-center pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <i class="fa-solid fa-building text-lg"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Stammdaten-Verwaltung</h3>
            <p class="text-xs text-slate-500">Zentrale Pflege von Standorten und Abteilungen</p>
          </div>
        </div>
        <button onclick="closeMasterModal()" class="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Tab Buttons -->
      <div class="flex border-b border-slate-200 mt-4">
        <button id="masterTabStandorte" onclick="switchMasterTab('standorte')" class="flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600 transition">
          <i class="fa-solid fa-building"></i> <span id="masterStandorteCount">Standorte</span>
        </button>
        <button id="masterTabAbteilungen" onclick="switchMasterTab('abteilungen')" class="flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition">
          <i class="fa-solid fa-layer-group"></i> <span id="masterAbteilungenCount">Abteilungen</span>
        </button>
      </div>

      <!-- Add Form -->
      <form onsubmit="addMasterItem(event)" class="mt-4 flex gap-2">
        <input type="text" id="newMasterInput" placeholder="Neuen Eintrag hinzufügen..." class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm">
          <i class="fa-solid fa-plus"></i> Hinzufügen
        </button>
      </form>

      <!-- Search Filter -->
      <div class="mt-4 relative">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
        <input type="text" id="masterSearchInput" oninput="renderMasterList()" placeholder="Einträge durchsuchen..." class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-500">
      </div>

      <!-- Item List Container -->
      <div id="masterListContainer" class="mt-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white"></div>

      <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <button onclick="closeMasterModal()" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition">
          Schließen
        </button>
      </div>
    </div>
  </div>

  <!-- vCard & QR Code Modal -->
  <div id="vcardModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden no-print p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-qrcode text-purple-600 text-lg"></i>
          <h3 class="text-base font-bold text-slate-900">Visitenkarte & QR-Code</h3>
        </div>
        <button onclick="closeVCardModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="space-y-4 pt-4 text-center">
        <div>
          <h4 id="vcardName" class="text-lg font-bold text-slate-900"></h4>
          <p id="vcardPosition" class="text-xs font-semibold text-blue-600"></p>
          <p id="vcardSub" class="text-xs text-slate-500 mt-0.5"></p>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner mx-auto">
          <img id="vcardQrImg" src="" alt="QR Code" class="w-44 h-44 rounded-lg mix-blend-multiply mx-auto">
          <p class="text-[11px] text-slate-500 mt-2 font-medium">
            Mit dem Smartphone scannen, um Kontakt im Telefonbuch zu speichern
          </p>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <button onclick="downloadVCardFile()" class="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/10 transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-download"></i>
            <span>vCard-Datei herunterladen (.vcf)</span>
          </button>

          <button id="btnCopyVCard" onclick="copyVCardText()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2">
            <i class="fa-regular fa-copy text-slate-500"></i>
            <span>vCard Text kopieren</span>
          </button>
        </div>
      </div>

      <div class="flex justify-end pt-4 mt-4 border-t border-slate-100">
        <button onclick="closeVCardModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition">
          Schließen
        </button>
      </div>
    </div>
  </div>

  <!-- Import / Export Modal -->
  <div id="importExportModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden no-print p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
      <div class="flex justify-between items-center pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <i class="fa-solid fa-database text-lg"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Daten sichern & wiederherstellen</h3>
            <p class="text-xs text-slate-500">JSON-Dateien exportieren oder importieren</p>
          </div>
        </div>
        <button onclick="closeImportExportModal()" class="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="space-y-6 pt-4">
        <!-- Export Box -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div class="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <i class="fa-solid fa-file-export text-blue-600"></i>
            <span>Kontaktdaten sichern (Export)</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Laden Sie alle aktuellen Kontakte als strukturiertes JSON herunter, um ein Backup zu erstellen.
          </p>
          <div class="flex gap-2">
            <button onclick="exportJson()" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm">
              <i class="fa-solid fa-download"></i> JSON Herunterladen
            </button>
            <button onclick="copyJsonClipboard()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5">
              <i class="fa-regular fa-copy"></i> Kopieren
            </button>
          </div>
        </div>

        <!-- Import Box -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div class="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <i class="fa-solid fa-file-import text-emerald-600"></i>
            <span>Sicherung wiederherstellen (Import)</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Wählen Sie eine zuvor gesicherte JSON-Datei aus. Sie können wählen, ob vorhandene Kontakte ersetzt oder zusammengeführt werden sollen.
          </p>

          <div class="flex items-center gap-4 text-xs">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="importMode" value="replace" checked class="text-blue-600">
              <span class="font-medium text-slate-700">Ersetzen</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="importMode" value="merge" class="text-blue-600">
              <span class="font-medium text-slate-700">Zusammenführen</span>
            </label>
          </div>

          <label class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
            <i class="fa-solid fa-upload"></i> JSON-Datei auswählen
            <input type="file" accept=".json" onchange="importJson(event)" class="hidden">
          </label>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <button onclick="closeImportExportModal()" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition">
          Schließen
        </button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-auto">
    ${title} · Standalone-Ausgabe · Speicherung erfolgt automatisch im lokalen Browser-Speicher (localStorage)
  </footer>

  <script>
    const INITIAL_DATA = ${jsonContacts};
    const INITIAL_STANDORTE = ${jsonStandorte};
    const INITIAL_ABTEILUNGEN = ${jsonAbteilungen};

    const STORAGE_KEY = 'telefonverzeichnis_kontakte_v5_full_pdf';
    const MASTER_STANDORTE_KEY = 'telefonverzeichnis_master_standorte_v2';
    const MASTER_ABTEILUNGEN_KEY = 'telefonverzeichnis_master_abteilungen_v2';

    let viewMode = 'table';
    let sortField = 'nachname';
    let sortOrder = 'asc';
    let alphabetFilter = '';
    let onlyFavorites = false;
    let collapsedGroups = {};
    let vCardContact = null;
    let masterActiveTab = 'standorte';
    let editingMasterItem = null;

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    function getContacts() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
        } catch(e) {}
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }

    function saveContacts(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateSelectOptions();
      render();
    }

    function getMasterStandorte() {
      const stored = localStorage.getItem(MASTER_STANDORTE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
      }
      localStorage.setItem(MASTER_STANDORTE_KEY, JSON.stringify(INITIAL_STANDORTE));
      return INITIAL_STANDORTE;
    }

    function saveMasterStandorte(list) {
      localStorage.setItem(MASTER_STANDORTE_KEY, JSON.stringify(list));
      updateSelectOptions();
      render();
    }

    function getMasterAbteilungen() {
      const stored = localStorage.getItem(MASTER_ABTEILUNGEN_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {}
      }
      localStorage.setItem(MASTER_ABTEILUNGEN_KEY, JSON.stringify(INITIAL_ABTEILUNGEN));
      return INITIAL_ABTEILUNGEN;
    }

    function saveMasterAbteilungen(list) {
      localStorage.setItem(MASTER_ABTEILUNGEN_KEY, JSON.stringify(list));
      updateSelectOptions();
      render();
    }

    function toggleFavorite(id) {
      const contacts = getContacts();
      const index = contacts.findIndex(c => c.id === id);
      if (index !== -1) {
        contacts[index].favorite = !contacts[index].favorite;
        saveContacts(contacts);
      }
    }

    function setViewMode(mode) {
      viewMode = mode;
      
      const btnTable = document.getElementById('btnViewTable');
      const btnCards = document.getElementById('btnViewCards');
      const btnGrouped = document.getElementById('btnViewGrouped');

      btnTable.className = mode === 'table' ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-white text-slate-900 shadow-sm border border-slate-200' : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900';
      btnCards.className = mode === 'cards' ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-white text-slate-900 shadow-sm border border-slate-200' : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900';
      btnGrouped.className = mode === 'grouped' ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-white text-slate-900 shadow-sm border border-slate-200' : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900';

      render();
    }

    function handleSort(field) {
      if (sortField === field) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortOrder = 'asc';
      }
      render();
    }

    function updateSelectOptions() {
      const contacts = getContacts();
      const masterStandorte = getMasterStandorte();
      const masterAbteilungen = getMasterAbteilungen();

      const locations = [...new Set([...masterStandorte, ...contacts.map(c => c.standort).filter(Boolean)])].sort();
      const abteilungen = [...new Set([...masterAbteilungen, ...contacts.map(c => c.abteilung).filter(Boolean)])].sort();

      const locationSelect = document.getElementById('locationSelect');
      const departmentSelect = document.getElementById('departmentSelect');
      const datalistLocations = document.getElementById('standorteList');
      const datalistDepts = document.getElementById('abteilungenList');

      const currentLoc = locationSelect.value;
      const currentDept = departmentSelect.value;

      locationSelect.innerHTML = '<option value="">Alle Standorte (' + locations.length + ')</option>' + locations.map(l => \`<option value="\${l}">\${l}</option>\`).join('');
      locationSelect.value = currentLoc;

      departmentSelect.innerHTML = '<option value="">Alle Abteilungen (' + abteilungen.length + ')</option>' + abteilungen.map(a => \`<option value="\${a}">\${a}</option>\`).join('');
      departmentSelect.value = currentDept;

      if (datalistLocations) {
        datalistLocations.innerHTML = locations.map(l => \`<option value="\${l}">\`).join('');
      }
      if (datalistDepts) {
        datalistDepts.innerHTML = abteilungen.map(a => \`<option value="\${a}">\`).join('');
      }

      // Update Header Stats
      document.getElementById('statTotalContacts').innerText = contacts.length;
      document.getElementById('statLocations').innerText = locations.length;
      document.getElementById('statDepartments').innerText = abteilungen.length;

      // Render Standort Pills
      const pillsContainer = document.getElementById('standortPillsContainer');
      let pillsHtml = \`
        <button onclick="selectStandortFilter('')" class="px-3 py-1 rounded-full font-medium transition shrink-0 \${!currentLoc ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          Alle
        </button>
      \`;
      locations.forEach(st => {
        const isSel = currentLoc === st;
        pillsHtml += \`
          <button onclick="selectStandortFilter('\${st}')" class="px-3 py-1 rounded-full font-medium transition shrink-0 \${isSel ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
            \${st}
          </button>
        \`;
      });
      pillsContainer.innerHTML = pillsHtml;

      // Render Alphabet bar
      const alphabetContainer = document.getElementById('alphabetContainer');
      let alphaHtml = \`
        <button onclick="setAlphabetFilter('')" class="px-2 py-0.5 rounded font-mono transition \${!alphabetFilter ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-100'}">
          Alle
        </button>
      \`;
      ALPHABET.forEach(letter => {
        const isSel = alphabetFilter === letter;
        alphaHtml += \`
          <button onclick="setAlphabetFilter('\${letter}')" class="px-1.5 py-0.5 rounded font-mono transition min-w-[22px] text-center \${isSel ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}">
            \${letter}
          </button>
        \`;
      });
      alphabetContainer.innerHTML = alphaHtml;
    }

    function selectStandortFilter(st) {
      document.getElementById('locationSelect').value = st;
      render();
    }

    function setAlphabetFilter(letter) {
      alphabetFilter = alphabetFilter === letter ? '' : letter;
      render();
    }

    function toggleOnlyFavoritesFilter() {
      onlyFavorites = !onlyFavorites;
      const btn = document.getElementById('btnFavoriteFilter');
      const icon = document.getElementById('starFilterIcon');

      if (onlyFavorites) {
        btn.className = 'flex items-center gap-1 px-3 py-1 rounded-full font-medium transition border bg-amber-50 text-amber-700 border-amber-300 shadow-sm';
        icon.className = 'fa-solid fa-star text-amber-500';
      } else {
        btn.className = 'flex items-center gap-1 px-3 py-1 rounded-full font-medium transition border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
        icon.className = 'fa-regular fa-star text-slate-400';
      }
      render();
    }

    function clearSearch() {
      document.getElementById('searchInput').value = '';
      render();
    }

    function resetFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('locationSelect').value = '';
      document.getElementById('departmentSelect').value = '';
      alphabetFilter = '';
      onlyFavorites = false;
      const btn = document.getElementById('btnFavoriteFilter');
      const icon = document.getElementById('starFilterIcon');
      btn.className = 'flex items-center gap-1 px-3 py-1 rounded-full font-medium transition border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
      icon.className = 'fa-regular fa-star text-slate-400';
      render();
    }

    function render() {
      const contacts = getContacts();
      const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
      const location = document.getElementById('locationSelect').value;
      const department = document.getElementById('departmentSelect').value;

      document.getElementById('btnClearSearch').className = search ? 'absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5' : 'hidden';

      const hasActiveFilters = Boolean(search) || Boolean(location) || Boolean(department) || Boolean(alphabetFilter) || onlyFavorites;
      document.getElementById('btnResetFilters').className = hasActiveFilters ? 'text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium cursor-pointer' : 'hidden';

      // Filtering
      let filtered = contacts.filter(c => {
        const matchesLoc = !location || c.standort === location;
        const matchesDept = !department || c.abteilung === department;
        const matchesFav = !onlyFavorites || Boolean(c.favorite);
        const matchesAlpha = !alphabetFilter || (c.nachname && c.nachname.toUpperCase().startsWith(alphabetFilter));
        const matchesSearch = !search || 
          (c.nachname + ' ' + c.vorname).toLowerCase().includes(search) ||
          (c.vorname + ' ' + c.nachname).toLowerCase().includes(search) ||
          (c.abteilung || '').toLowerCase().includes(search) ||
          (c.position || '').toLowerCase().includes(search) ||
          (c.festnetz || '').toLowerCase().includes(search) ||
          (c.mobil || '').toLowerCase().includes(search) ||
          (c.email || '').toLowerCase().includes(search) ||
          (c.raum || '').toLowerCase().includes(search) ||
          (c.notizen || '').toLowerCase().includes(search) ||
          (c.standort || '').toLowerCase().includes(search);

        return matchesLoc && matchesDept && matchesFav && matchesAlpha && matchesSearch;
      });

      // Sorting
      filtered.sort((a, b) => {
        let valA = (a[sortField] || '').toString().toLowerCase();
        let valB = (b[sortField] || '').toString().toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      updateSelectOptions();

      document.getElementById('counterText').innerHTML = \`
        Zeige <strong class="text-slate-800 font-semibold">\${filtered.length}</strong> von <strong class="text-slate-800 font-semibold">\${contacts.length}</strong> Kontakten
        \${hasActiveFilters ? '<span class="ml-2 text-blue-600 font-medium">(Gefiltert)</span>' : ''}
      \`;

      const container = document.getElementById('contactContainer');

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm my-6">
            <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <i class="fa-solid fa-address-book text-xl"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800">Keine Kontakte gefunden</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Versuchen Sie Ihre Suchbegriffe oder aktiven Filter anzupassen.</p>
            <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition">
              Filter zurücksetzen
            </button>
          </div>
        \`;
        return;
      }

      if (viewMode === 'table') {
        renderTableView(filtered, container);
      } else if (viewMode === 'cards') {
        renderCardsView(filtered, container);
      } else if (viewMode === 'grouped') {
        renderGroupedView(filtered, container);
      }
    }

    function getSortIcon(field) {
      if (sortField !== field) return '<i class="fa-solid fa-sort text-slate-300 ml-1.5 text-[10px]"></i>';
      return sortOrder === 'asc' ? '<i class="fa-solid fa-sort-up text-blue-600 ml-1.5 text-[10px]"></i>' : '<i class="fa-solid fa-sort-down text-blue-600 ml-1.5 text-[10px]"></i>';
    }

    function renderTableView(list, container) {
      let html = \`
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden print-shadow-none">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead class="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 select-none">
                <tr>
                  <th class="py-3 px-3 w-10 text-center no-print"><i class="fa-regular fa-star text-slate-400"></i></th>
                  <th onclick="handleSort('nachname')" class="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                    Name / Vorname \${getSortIcon('nachname')}
                  </th>
                  <th onclick="handleSort('position')" class="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                    Position / Abteilung \${getSortIcon('position')}
                  </th>
                  <th onclick="handleSort('standort')" class="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                    Standort \${getSortIcon('standort')}
                  </th>
                  <th class="py-3 px-4">Festnetz</th>
                  <th class="py-3 px-4">Mobil</th>
                  <th class="py-3 px-4">E-Mail</th>
                  <th class="py-3 px-4 text-right no-print">Aktionen</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
      \`;

      list.forEach(c => {
        const isFav = Boolean(c.favorite);
        html += \`
          <tr class="hover:bg-slate-50/80 transition group">
            <td class="py-3 px-3 text-center no-print">
              <button onclick="toggleFavorite('\${c.id}')" class="p-1 rounded-lg text-slate-300 hover:text-amber-500 transition" title="Favorit umschalten">
                <i class="\${isFav ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star hover:text-amber-400'}"></i>
              </button>
            </td>
            <td class="py-3 px-4">
              <div class="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                <span>\${c.nachname}, \${c.vorname}</span>
              </div>
            </td>
            <td class="py-3 px-4">
              <div class="font-medium text-slate-800">\${c.position || '-'}</div>
              <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span>\${c.abteilung || '-'}</span>
                \${c.raum ? \`<span class="text-slate-400">· Raum \${c.raum}</span>\` : ''}
              </div>
            </td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <i class="fa-solid fa-location-dot text-slate-400 text-[10px]"></i>
                \${c.standort || '-'}
              </span>
            </td>
            <td class="py-3 px-4 font-mono text-xs whitespace-nowrap">
              <a href="tel:\${c.festnetz}" class="text-blue-600 hover:underline flex items-center gap-1.5 font-medium">
                <i class="fa-solid fa-phone text-blue-500"></i> \${c.festnetz || '-'}
              </a>
            </td>
            <td class="py-3 px-4 font-mono text-xs whitespace-nowrap">
              \${c.mobil ? \`
                <a href="tel:\${c.mobil}" class="text-emerald-600 hover:underline flex items-center gap-1.5 font-medium">
                  <i class="fa-solid fa-mobile-screen text-emerald-500"></i> \${c.mobil}
                </a>
              \` : '<span class="text-slate-300">-</span>'}
            </td>
            <td class="py-3 px-4 text-xs">
              <a href="mailto:\${c.email}" class="text-slate-700 hover:text-blue-600 hover:underline flex items-center gap-1.5 truncate max-w-[180px]">
                <i class="fa-regular fa-envelope text-slate-400"></i> \${c.email || '-'}
              </a>
            </td>
            <td class="py-3 px-4 text-right no-print whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                <button onclick="openVCardModal('\${c.id}')" class="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title="vCard & QR Code">
                  <i class="fa-solid fa-qrcode"></i>
                </button>
                <button onclick="editContact('\${c.id}')" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Bearbeiten">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deleteContact('\${c.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Löschen">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        \`;
      });

      html += \`
              </tbody>
            </table>
          </div>
        </div>
      \`;
      container.innerHTML = html;
    }

    function renderCardsView(list, container) {
      let html = \`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">\`;
      list.forEach(c => {
        const isFav = Boolean(c.favorite);
        html += \`
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between print-shadow-none page-break-inside-avoid relative">
            <div>
              <div class="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h4 class="font-bold text-slate-900 text-base leading-tight flex items-center gap-2">
                    \${c.nachname}, \${c.vorname}
                  </h4>
                  <p class="text-xs font-semibold text-blue-600 mt-0.5">\${c.position}</p>
                </div>
                
                <button onclick="toggleFavorite('\${c.id}')" class="p-1.5 rounded-lg hover:bg-slate-100 transition no-print">
                  <i class="\${isFav ? 'fa-solid fa-star text-amber-400 text-base' : 'fa-regular fa-star text-slate-300 text-base hover:text-amber-400'}"></i>
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-1.5 my-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <i class="fa-solid fa-location-dot text-slate-400 text-[10px]"></i> \${c.standort}
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <i class="fa-solid fa-sitemap text-blue-400 text-[10px]"></i> \${c.abteilung}
                </span>
                \${c.raum ? \`
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <i class="fa-solid fa-door-open text-amber-500 text-[10px]"></i> Raum \${c.raum}
                  </span>
                \` : ''}
              </div>

              <div class="space-y-1.5 pt-3 border-t border-slate-100 text-xs font-mono">
                <a href="tel:\${c.festnetz}" class="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium">
                  <i class="fa-solid fa-phone text-blue-500 w-4"></i> \${c.festnetz}
                </a>
                \${c.mobil ? \`
                  <a href="tel:\${c.mobil}" class="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-medium">
                    <i class="fa-solid fa-mobile-screen text-emerald-500 w-4"></i> \${c.mobil}
                  </a>
                \` : ''}
                <a href="mailto:\${c.email}" class="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-sans truncate">
                  <i class="fa-regular fa-envelope text-slate-400 w-4"></i> \${c.email}
                </a>
              </div>

              \${c.notizen ? \`
                <p class="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 italic">
                  \${c.notizen}
                </p>
              \` : ''}
            </div>

            <div class="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 no-print text-xs">
              <button onclick="openVCardModal('\${c.id}')" class="px-2.5 py-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-semibold transition flex items-center gap-1.5">
                <i class="fa-solid fa-qrcode"></i> vCard
              </button>

              <div class="flex items-center gap-1">
                <button onclick="editContact('\${c.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg font-medium transition flex items-center gap-1">
                  <i class="fa-solid fa-pen-to-square"></i> Bearbeiten
                </button>
                <button onclick="deleteContact('\${c.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg font-medium transition flex items-center gap-1">
                  <i class="fa-solid fa-trash"></i> Löschen
                </button>
              </div>
            </div>
          </div>
        \`;
      });
      html += \`</div>\`;
      container.innerHTML = html;
    }

    function renderGroupedView(list, container) {
      const groups = {};
      list.forEach(c => {
        const key = c.standort || 'Ohne Standort';
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
      });

      const groupKeys = Object.keys(groups).sort();
      let html = \`<div class="space-y-6">\`;

      groupKeys.forEach(standort => {
        const groupList = groups[standort];
        const isCollapsed = Boolean(collapsedGroups[standort]);

        html += \`
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-shadow-none page-break-inside-avoid">
            <div 
              onclick="toggleGroupCollapse('\${standort}')" 
              class="bg-slate-900 text-white p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition select-none"
            >
              <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-location-dot text-blue-400 text-lg"></i>
                <h2 class="text-base font-bold tracking-tight">\${standort}</h2>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 ml-2">
                  <i class="fa-solid fa-users text-[10px]"></i>
                  \${groupList.length} \${groupList.length === 1 ? 'Kontakt' : 'Kontakte'}
                </span>
              </div>

              <div class="text-slate-400 hover:text-white transition">
                <i class="fa-solid \${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'}"></i>
              </div>
            </div>

            \${!isCollapsed ? \`
              <div class="p-1">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm border-collapse">
                    <thead class="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3 w-10 text-center no-print"><i class="fa-regular fa-star text-slate-400"></i></th>
                        <th class="py-2.5 px-4">Name / Vorname</th>
                        <th class="py-2.5 px-4">Position / Abteilung</th>
                        <th class="py-2.5 px-4">Festnetz</th>
                        <th class="py-2.5 px-4">Mobil</th>
                        <th class="py-2.5 px-4">E-Mail</th>
                        <th class="py-2.5 px-4 text-right no-print">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                      \${groupList.map(c => \`
                        <tr class="hover:bg-slate-50/80 transition group">
                          <td class="py-2.5 px-3 text-center no-print">
                            <button onclick="toggleFavorite('\${c.id}')" class="p-1 rounded-lg text-slate-300 hover:text-amber-500 transition">
                              <i class="\${c.favorite ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star hover:text-amber-400'}"></i>
                            </button>
                          </td>
                          <td class="py-2.5 px-4 font-bold text-slate-900">\${c.nachname}, \${c.vorname}</td>
                          <td class="py-2.5 px-4">
                            <div class="font-medium text-slate-800">\${c.position || '-'}</div>
                            <div class="text-xs text-slate-500">\${c.abteilung || '-'} \${c.raum ? '· Raum ' + c.raum : ''}</div>
                          </td>
                          <td class="py-2.5 px-4 font-mono text-xs">
                            <a href="tel:\${c.festnetz}" class="text-blue-600 hover:underline"><i class="fa-solid fa-phone text-blue-500 mr-1"></i> \${c.festnetz}</a>
                          </td>
                          <td class="py-2.5 px-4 font-mono text-xs">
                            \${c.mobil ? \`<a href="tel:\${c.mobil}" class="text-emerald-600 hover:underline"><i class="fa-solid fa-mobile-screen text-emerald-500 mr-1"></i> \${c.mobil}</a>\` : '<span class="text-slate-300">-</span>'}
                          </td>
                          <td class="py-2.5 px-4 text-xs">
                            <a href="mailto:\${c.email}" class="text-slate-700 hover:text-blue-600 truncate max-w-[160px] block"><i class="fa-regular fa-envelope text-slate-400 mr-1"></i> \${c.email}</a>
                          </td>
                          <td class="py-2.5 px-4 text-right no-print">
                            <div class="flex items-center justify-end gap-1">
                              <button onclick="openVCardModal('\${c.id}')" class="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><i class="fa-solid fa-qrcode"></i></button>
                              <button onclick="editContact('\${c.id}')" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><i class="fa-solid fa-pen-to-square"></i></button>
                              <button onclick="deleteContact('\${c.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><i class="fa-solid fa-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      \`).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            \` : ''}
          </div>
        \`;
      });

      html += \`</div>\`;
      container.innerHTML = html;
    }

    function toggleGroupCollapse(standort) {
      collapsedGroups[standort] = !collapsedGroups[standort];
      render();
    }

    // Modal Add / Edit Contact
    function openModal(id = null) {
      document.getElementById('editId').value = id || '';
      document.getElementById('modalTitle').innerText = id ? 'Kontakt bearbeiten' : 'Neuer Kontakt';
      
      if (id) {
        const contacts = getContacts();
        const c = contacts.find(item => item.id === id);
        if (c) {
          document.getElementById('inputVorname').value = c.vorname || '';
          document.getElementById('inputNachname').value = c.nachname || '';
          document.getElementById('inputStandort').value = c.standort || '';
          document.getElementById('inputPosition').value = c.position || '';
          document.getElementById('inputAbteilung').value = c.abteilung || '';
          document.getElementById('inputFestnetz').value = c.festnetz || '';
          document.getElementById('inputMobil').value = c.mobil || '';
          document.getElementById('inputEmail').value = c.email || '';
          document.getElementById('inputRaum').value = c.raum || '';
          document.getElementById('inputNotizen').value = c.notizen || '';
        }
      } else {
        document.getElementById('contactForm').reset();
      }
      
      document.getElementById('modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
    }

    function saveContact(e) {
      e.preventDefault();
      const id = document.getElementById('editId').value;
      const contacts = getContacts();

      const existingIndex = id ? contacts.findIndex(item => item.id === id) : -1;
      const existing = existingIndex !== -1 ? contacts[existingIndex] : {};

      const newContact = {
        ...existing,
        id: id || ('c-' + Date.now() + Math.random().toString(36).substring(2, 5)),
        vorname: document.getElementById('inputVorname').value.trim(),
        nachname: document.getElementById('inputNachname').value.trim(),
        standort: document.getElementById('inputStandort').value.trim(),
        position: document.getElementById('inputPosition').value.trim(),
        abteilung: document.getElementById('inputAbteilung').value.trim(),
        festnetz: document.getElementById('inputFestnetz').value.trim(),
        mobil: document.getElementById('inputMobil').value.trim(),
        email: document.getElementById('inputEmail').value.trim(),
        raum: document.getElementById('inputRaum').value.trim(),
        notizen: document.getElementById('inputNotizen').value.trim(),
        updatedAt: new Date().toISOString()
      };

      if (id && existingIndex !== -1) {
        contacts[existingIndex] = newContact;
      } else {
        contacts.unshift(newContact);
      }

      saveContacts(contacts);
      closeModal();
    }

    function editContact(id) {
      openModal(id);
    }

    function deleteContact(id) {
      const contacts = getContacts();
      const c = contacts.find(item => item.id === id);
      const name = c ? (c.vorname + ' ' + c.nachname) : 'diesen Kontakt';

      if (confirm(\`Möchten Sie "\${name}" wirklich unwiderruflich löschen?\`)) {
        const list = contacts.filter(item => item.id !== id);
        saveContacts(list);
      }
    }

    // Reset dataset to initial PDF data
    function resetSampleData() {
      if (confirm('Möchten Sie das Telefonverzeichnis wirklich auf alle Kontakte aus dem PDF-Dokument zurücksetzen? Alle bisherigen lokalen Änderungen werden überschrieben.')) {
        localStorage.removeItem(STORAGE_KEY);
        saveContacts(INITIAL_DATA);
        alert('Telefonverzeichnis erfolgreich auf die vollständigen PDF-Kontaktdaten zurückgesetzt.');
      }
    }

    // vCard Modal
    function generateVCardString(c) {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        \`N:\${c.nachname || ''};\${c.vorname || ''};;;\`,
        \`FN:\${(c.vorname || '') + ' ' + (c.nachname || '')}\`.trim(),
        \`ORG:Verwaltung;\${c.abteilung || ''}\`,
        c.position ? \`TITLE:\${c.position}\` : '',
        c.festnetz ? \`TEL;TYPE=WORK,VOICE:\${c.festnetz}\` : '',
        c.mobil ? \`TEL;TYPE=CELL,VOICE:\${c.mobil}\` : '',
        c.email ? \`EMAIL;TYPE=PREF,INTERNET:\${c.email}\` : '',
        c.raum ? \`NOTE:Raum \${c.raum}\` : '',
        'END:VCARD'
      ];
      return lines.filter(Boolean).join('\\r\\n');
    }

    function openVCardModal(id) {
      const contacts = getContacts();
      vCardContact = contacts.find(c => c.id === id);
      if (!vCardContact) return;

      document.getElementById('vcardName').innerText = \`\${vCardContact.vorname} \${vCardContact.nachname}\`;
      document.getElementById('vcardPosition').innerText = vCardContact.position || '';
      document.getElementById('vcardSub').innerText = \`\${vCardContact.standort} · \${vCardContact.abteilung}\`;

      const vCardStr = generateVCardString(vCardContact);
      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(vCardStr);
      document.getElementById('vcardQrImg').src = qrUrl;

      document.getElementById('vcardModal').classList.remove('hidden');
    }

    function closeVCardModal() {
      document.getElementById('vcardModal').classList.add('hidden');
      vCardContact = null;
    }

    function downloadVCardFile() {
      if (!vCardContact) return;
      const vCardStr = generateVCardString(vCardContact);
      const blob = new Blob([vCardStr], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = \`\${vCardContact.nachname}_\${vCardContact.vorname}.vcf\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    function copyVCardText() {
      if (!vCardContact) return;
      const vCardStr = generateVCardString(vCardContact);
      navigator.clipboard.writeText(vCardStr).then(() => {
        const btn = document.getElementById('btnCopyVCard');
        btn.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i> <span>In Zwischenablage kopiert!</span>';
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-regular fa-copy text-slate-500"></i> <span>vCard Text kopieren</span>';
        }, 2000);
      });
    }

    // Import / Export Modal
    function openImportExportModal() {
      document.getElementById('importExportModal').classList.remove('hidden');
    }

    function closeImportExportModal() {
      document.getElementById('importExportModal').classList.add('hidden');
    }

    function exportJson() {
      const contacts = getContacts();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", "telefonverzeichnis_kontakte.json");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }

    function copyJsonClipboard() {
      const contacts = getContacts();
      navigator.clipboard.writeText(JSON.stringify(contacts, null, 2)).then(() => {
        alert('JSON-Kontaktdaten erfolgreich in die Zwischenablage kopiert!');
      });
    }

    function importJson(event) {
      const file = event.target.files[0];
      if (!file) return;

      const radios = document.getElementsByName('importMode');
      let mode = 'replace';
      for (let r of radios) {
        if (r.checked) mode = r.value;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            const current = getContacts();
            let result = [];
            if (mode === 'replace') {
              if (confirm(\`Möchten Sie alle bestehenden Kontakte durch die \${imported.length} importierten Kontakte ERSETZEN?\`)) {
                result = imported;
              } else {
                return;
              }
            } else {
              // Merge
              const existingIds = new Set(current.map(c => c.id));
              const newItems = imported.filter(c => !existingIds.has(c.id));
              result = [...current, ...newItems];
              alert(\`\${newItems.length} neue Kontakte wurden erfolgreich zusammengeführt!\`);
            }
            saveContacts(result);
            closeImportExportModal();
            alert('Import erfolgreich abgeschlossen!');
          } else {
            alert('Ungültiges Format: Die JSON-Datei muss ein Array von Kontakten enthalten.');
          }
        } catch (err) {
          alert('Fehler beim Lesen der JSON-Datei: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    // Master Data Modal Functions
    function openMasterModal() {
      masterActiveTab = 'standorte';
      editingMasterItem = null;
      document.getElementById('newMasterInput').value = '';
      document.getElementById('masterSearchInput').value = '';
      updateMasterTabButtons();
      renderMasterList();
      document.getElementById('masterModal').classList.remove('hidden');
    }

    function closeMasterModal() {
      document.getElementById('masterModal').classList.add('hidden');
    }

    function switchMasterTab(tab) {
      masterActiveTab = tab;
      editingMasterItem = null;
      document.getElementById('newMasterInput').value = '';
      document.getElementById('masterSearchInput').value = '';
      updateMasterTabButtons();
      renderMasterList();
    }

    function updateMasterTabButtons() {
      const standorte = getMasterStandorte();
      const abteilungen = getMasterAbteilungen();

      document.getElementById('masterStandorteCount').innerText = \`Standorte (\${standorte.length})\`;
      document.getElementById('masterAbteilungenCount').innerText = \`Abteilungen (\${abteilungen.length})\`;

      const tabStandorte = document.getElementById('masterTabStandorte');
      const tabAbteilungen = document.getElementById('masterTabAbteilungen');

      if (masterActiveTab === 'standorte') {
        tabStandorte.className = 'flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600 transition';
        tabAbteilungen.className = 'flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition';
      } else {
        tabAbteilungen.className = 'flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600 transition';
        tabStandorte.className = 'flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition';
      }
    }

    function renderMasterList() {
      const isStandort = masterActiveTab === 'standorte';
      const list = isStandort ? getMasterStandorte() : getMasterAbteilungen();
      const search = (document.getElementById('masterSearchInput').value || '').toLowerCase().trim();

      const filtered = list.filter(item => item.toLowerCase().includes(search));
      const container = document.getElementById('masterListContainer');

      if (filtered.length === 0) {
        container.innerHTML = \`<div class="p-8 text-center text-slate-400 text-xs">Keine Einträge gefunden.</div>\`;
        return;
      }

      let html = '';
      filtered.forEach(item => {
        if (editingMasterItem === item) {
          html += \`
            <div class="flex items-center justify-between px-4 py-2 hover:bg-slate-50">
              <input type="text" id="editMasterInput" value="\${item}" class="flex-1 px-3 py-1 text-sm border border-indigo-400 rounded-lg outline-none mr-2">
              <button onclick="saveMasterEdit('\${item}')" class="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 mr-1"><i class="fa-solid fa-check"></i></button>
              <button onclick="cancelMasterEdit()" class="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><i class="fa-solid fa-xmark"></i></button>
            </div>
          \`;
        } else {
          html += \`
            <div class="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50">
              <span class="text-sm font-medium text-slate-800">\${item}</span>
              <div class="flex items-center gap-1">
                <button onclick="startMasterEdit('\${item}')" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Bearbeiten"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteMasterItem('\${item}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Löschen"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          \`;
        }
      });

      container.innerHTML = html;
    }

    function addMasterItem(e) {
      e.preventDefault();
      const val = document.getElementById('newMasterInput').value.trim();
      if (!val) return;

      if (masterActiveTab === 'standorte') {
        const list = getMasterStandorte();
        if (!list.includes(val)) {
          list.push(val);
          list.sort();
          saveMasterStandorte(list);
        }
      } else {
        const list = getMasterAbteilungen();
        if (!list.includes(val)) {
          list.push(val);
          list.sort();
          saveMasterAbteilungen(list);
        }
      }

      document.getElementById('newMasterInput').value = '';
      updateMasterTabButtons();
      renderMasterList();
    }

    function startMasterEdit(item) {
      editingMasterItem = item;
      renderMasterList();
    }

    function cancelMasterEdit() {
      editingMasterItem = null;
      renderMasterList();
    }

    function saveMasterEdit(oldItem) {
      const newVal = document.getElementById('editMasterInput').value.trim();
      if (!newVal || newVal === oldItem) {
        editingMasterItem = null;
        renderMasterList();
        return;
      }

      if (masterActiveTab === 'standorte') {
        const list = getMasterStandorte().map(x => x === oldItem ? newVal : x).sort();
        saveMasterStandorte(list);

        const contacts = getContacts();
        let changed = false;
        contacts.forEach(c => {
          if (c.standort === oldItem) {
            c.standort = newVal;
            changed = true;
          }
        });
        if (changed) saveContacts(contacts);
      } else {
        const list = getMasterAbteilungen().map(x => x === oldItem ? newVal : x).sort();
        saveMasterAbteilungen(list);

        const contacts = getContacts();
        let changed = false;
        contacts.forEach(c => {
          if (c.abteilung === oldItem) {
            c.abteilung = newVal;
            changed = true;
          }
        });
        if (changed) saveContacts(contacts);
      }

      editingMasterItem = null;
      updateMasterTabButtons();
      renderMasterList();
    }

    function deleteMasterItem(item) {
      if (!confirm(\`Möchten Sie "\${item}" wirklich aus den Stammdaten löschen?\`)) return;

      if (masterActiveTab === 'standorte') {
        const list = getMasterStandorte().filter(x => x !== item);
        saveMasterStandorte(list);
      } else {
        const list = getMasterAbteilungen().filter(x => x !== item);
        saveMasterAbteilungen(list);
      }

      updateMasterTabButtons();
      renderMasterList();
    }

    // Init
    updateSelectOptions();
    render();
  </script>
</body>
</html>`;
}
