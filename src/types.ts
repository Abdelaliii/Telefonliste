export type ViewMode = 'table' | 'cards' | 'grouped';

export interface Contact {
  id: string;
  standort: string;
  nachname: string;
  vorname: string;
  position: string;
  abteilung: string;
  festnetz: string;
  mobil?: string;
  email: string;
  raum?: string;
  notizen?: string;
  isFavorite?: boolean;
  updatedAt?: string;
  eintrittDatum?: string;
  austrittDatum?: string;
  geandertAm?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedStandort: string;
  selectedAbteilung: string;
  onlyFavorites: boolean;
  alphabetFilter: string;
}

export type SortField = 'nachname' | 'vorname' | 'standort' | 'abteilung' | 'position' | 'festnetz';
export type SortOrder = 'asc' | 'desc';
