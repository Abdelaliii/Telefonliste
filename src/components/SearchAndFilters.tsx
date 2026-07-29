import React from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Building2, 
  Star, 
  LayoutList, 
  LayoutGrid, 
  Layers,
  RotateCcw
} from 'lucide-react';
import { ViewMode, FilterState } from '../types';

interface SearchAndFiltersProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  allStandorte: string[];
  allAbteilungen: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFilterChange,
  allStandorte,
  allAbteilungen,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
  onResetFilters,
}) => {
  const hasActiveFilters = 
    Boolean(filters.searchQuery) || 
    Boolean(filters.selectedStandort) || 
    Boolean(filters.selectedAbteilung) || 
    filters.onlyFavorites || 
    Boolean(filters.alphabetFilter);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-6 space-y-4 no-print">
      
      {/* Top Bar: Search + Location Filter + View Mode */}
      <div className="flex flex-col lg:flex-row gap-3">
        
        {/* Live Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Live-Suche nach Name, Abteilung, Position, Telefon, Email, Raum..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
            id="search-input"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="relative min-w-[200px]">
          <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <select
            value={filters.selectedStandort}
            onChange={(e) => onFilterChange({ selectedStandort: e.target.value })}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 appearance-none transition cursor-pointer"
            id="select-standort"
          >
            <option value="">Alle Standorte ({allStandorte.length})</option>
            {allStandorte.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Department Dropdown */}
        <div className="relative min-w-[200px]">
          <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <select
            value={filters.selectedAbteilung}
            onChange={(e) => onFilterChange({ selectedAbteilung: e.target.value })}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 appearance-none transition cursor-pointer"
            id="select-abteilung"
          >
            <option value="">Alle Abteilungen ({allAbteilungen.length})</option>
            {allAbteilungen.map((abt) => (
              <option key={abt} value={abt}>
                {abt}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 shrink-0 self-start lg:self-auto">
          <button
            onClick={() => onViewModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tabellenansicht"
            id="btn-view-table"
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Tabelle</span>
          </button>
          <button
            onClick={() => onViewModeChange('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Kartenansicht"
            id="btn-view-cards"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Karten</span>
          </button>
          <button
            onClick={() => onViewModeChange('grouped')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grouped'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Gruppiert nach Standort"
            id="btn-view-grouped"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Gruppiert</span>
          </button>
        </div>

      </div>

      {/* Standort Filter Tabs (Quick Pill Bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-400 font-medium mr-1 shrink-0">Standort:</span>
        <button
          onClick={() => onFilterChange({ selectedStandort: '' })}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            !filters.selectedStandort
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
          }`}
        >
          Alle
        </button>
        {allStandorte.map((st) => (
          <button
            key={st}
            onClick={() => onFilterChange({ selectedStandort: filters.selectedStandort === st ? '' : st })}
            className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
              filters.selectedStandort === st
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            {st}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={() => onFilterChange({ onlyFavorites: !filters.onlyFavorites })}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition border ${
              filters.onlyFavorites
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>Favoriten</span>
          </button>
        </div>
      </div>

      {/* Alphabet Quick Jumper Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs pt-2 border-t border-slate-100 scrollbar-none">
        <span className="text-slate-400 font-medium mr-1 shrink-0">A-Z:</span>
        <button
          onClick={() => onFilterChange({ alphabetFilter: '' })}
          className={`px-2 py-0.5 rounded font-mono transition ${
            !filters.alphabetFilter ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Alle
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() => onFilterChange({ alphabetFilter: filters.alphabetFilter === letter ? '' : letter })}
            className={`px-1.5 py-0.5 rounded font-mono transition min-w-[22px] text-center ${
              filters.alphabetFilter === letter
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Bottom Summary & Clear Filters */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div>
          Zeige <strong className="text-slate-800 font-semibold">{filteredCount}</strong> von{' '}
          <strong className="text-slate-800 font-semibold">{totalCount}</strong> Kontakten
          {hasActiveFilters && <span className="ml-2 text-blue-600 font-medium">(Gefiltert)</span>}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Filter zurücksetzen
          </button>
        )}
      </div>

    </div>
  );
};
