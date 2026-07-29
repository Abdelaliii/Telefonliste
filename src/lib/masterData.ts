import { STANDORTE_INITIAL, ABTEILUNGEN_INITIAL } from '../data/initialContacts';

const MASTER_STANDORTE_KEY = 'telefonverzeichnis_master_standorte_v2';
const MASTER_ABTEILUNGEN_KEY = 'telefonverzeichnis_master_abteilungen_v2';

export function loadMasterStandorte(): string[] {
  try {
    const raw = localStorage.getItem(MASTER_STANDORTE_KEY);
    if (!raw) {
      saveMasterStandorte(STANDORTE_INITIAL);
      return STANDORTE_INITIAL;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort();
    }
  } catch (err) {
    console.error('Error loading master standorte:', err);
  }
  saveMasterStandorte(STANDORTE_INITIAL);
  return STANDORTE_INITIAL;
}

export function saveMasterStandorte(list: string[]): void {
  try {
    localStorage.setItem(MASTER_STANDORTE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving master standorte:', err);
  }
}

export function loadMasterAbteilungen(): string[] {
  try {
    const raw = localStorage.getItem(MASTER_ABTEILUNGEN_KEY);
    if (!raw) {
      saveMasterAbteilungen(ABTEILUNGEN_INITIAL);
      return ABTEILUNGEN_INITIAL;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort();
    }
  } catch (err) {
    console.error('Error loading master abteilungen:', err);
  }
  saveMasterAbteilungen(ABTEILUNGEN_INITIAL);
  return ABTEILUNGEN_INITIAL;
}

export function saveMasterAbteilungen(list: string[]): void {
  try {
    localStorage.setItem(MASTER_ABTEILUNGEN_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving master abteilungen:', err);
  }
}
