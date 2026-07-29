import { Contact } from '../types';
import { INITIAL_CONTACTS } from '../data/initialContacts';

const STORAGE_KEY = 'telefonverzeichnis_kontakte_v5_full_pdf';

export function loadContactsFromStorage(): Contact[] {
  try {
    // Clear old versions if necessary
    localStorage.removeItem('telefonverzeichnis_kontakte_v1');
    localStorage.removeItem('telefonverzeichnis_kontakte_v2');
    localStorage.removeItem('telefonverzeichnis_kontakte_v3');
    
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveContactsToStorage(INITIAL_CONTACTS);
      return INITIAL_CONTACTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 10) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse stored contacts, loading defaults:', err);
  }
  saveContactsToStorage(INITIAL_CONTACTS);
  return INITIAL_CONTACTS;
}

export function saveContactsToStorage(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Failed to save contacts to localStorage:', err);
  }
}

export function exportContactsToJson(contacts: Contact[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Telefonverzeichnis_Export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function generateVCard(contact: Contact): string {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${contact.nachname};${contact.vorname};;;`,
    `FN:${contact.vorname} ${contact.nachname}`,
    `ORG:${contact.standort};${contact.abteilung}`,
    `TITLE:${contact.position}`,
    `TEL;TYPE=WORK,VOICE:${contact.festnetz}`,
    contact.mobil ? `TEL;TYPE=CELL,VOICE:${contact.mobil}` : '',
    `EMAIL;TYPE=PREF,INTERNET:${contact.email}`,
    contact.raum ? `NOTE:Büro: ${contact.raum} - ${contact.notizen || ''}` : `NOTE:${contact.notizen || ''}`,
    'END:VCARD'
  ].filter(Boolean).join('\n');
}
