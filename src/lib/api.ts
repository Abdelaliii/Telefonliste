import { Contact } from '../types';
import { loadContactsFromStorage, saveContactsToStorage } from './storage';
import { loadMasterStandorte, saveMasterStandorte, loadMasterAbteilungen, saveMasterAbteilungen } from './masterData';

export interface ServerStatus {
  isConnected: boolean;
  message: string;
}

// Fetch all contacts from server or local fallback
export async function fetchContactsApi(): Promise<{ contacts: Contact[]; isServerConnected: boolean }> {
  try {
    const res = await fetch('/api/contacts', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveContactsToStorage(data); // keep local cache in sync
        return { contacts: data, isServerConnected: true };
      }
    }
  } catch (err) {
    console.warn('[API] Server connection unavailable, falling back to LocalStorage:', err);
  }
  return { contacts: loadContactsFromStorage(), isServerConnected: false };
}

// Save or update contact on server
export async function saveContactApi(contactData: Omit<Contact, 'id'> & { id?: string }): Promise<{ contacts: Contact[]; isServerConnected: boolean }> {
  try {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.contacts) {
        saveContactsToStorage(data.contacts);
        return { contacts: data.contacts, isServerConnected: true };
      }
    }
  } catch (err) {
    console.warn('[API] Failed to save contact on server:', err);
  }
  
  // Local fallback
  const current = loadContactsFromStorage();
  let updated: Contact[];
  if (contactData.id) {
    updated = current.map((item) => (item.id === contactData.id ? (contactData as Contact) : item));
  } else {
    const newContact: Contact = {
      ...contactData,
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updated = [newContact, ...current];
  }
  saveContactsToStorage(updated);
  return { contacts: updated, isServerConnected: false };
}

// Delete contact on server
export async function deleteContactApi(id: string): Promise<{ contacts: Contact[]; isServerConnected: boolean }> {
  try {
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const contactsRes = await fetchContactsApi();
      return contactsRes;
    }
  } catch (err) {
    console.warn('[API] Failed to delete contact on server:', err);
  }

  const current = loadContactsFromStorage().filter((c) => c.id !== id);
  saveContactsToStorage(current);
  return { contacts: current, isServerConnected: false };
}

// Reset contacts on server
export async function resetContactsApi(): Promise<{ contacts: Contact[]; isServerConnected: boolean }> {
  try {
    const res = await fetch('/api/contacts/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.contacts) {
        saveContactsToStorage(data.contacts);
        return { contacts: data.contacts, isServerConnected: true };
      }
    }
  } catch (err) {
    console.warn('[API] Failed to reset contacts on server:', err);
  }
  
  const contactsRes = await fetchContactsApi();
  return contactsRes;
}

// Fetch master data (standorte & abteilungen)
export async function fetchMasterDataApi(): Promise<{ standorte: string[]; abteilungen: string[]; isServerConnected: boolean }> {
  try {
    const res = await fetch('/api/master', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.standorte && data.abteilungen) {
        saveMasterStandorte(data.standorte);
        saveMasterAbteilungen(data.abteilungen);
        return { standorte: data.standorte, abteilungen: data.abteilungen, isServerConnected: true };
      }
    }
  } catch (err) {
    console.warn('[API] Master data server unavailable:', err);
  }

  return {
    standorte: loadMasterStandorte(),
    abteilungen: loadMasterAbteilungen(),
    isServerConnected: false
  };
}

// Save standorte to server
export async function saveStandorteApi(standorte: string[]): Promise<boolean> {
  saveMasterStandorte(standorte);
  try {
    const res = await fetch('/api/master/standorte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standorte })
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Failed to save standorte on server:', err);
    return false;
  }
}

// Save abteilungen to server
export async function saveAbteilungenApi(abteilungen: string[]): Promise<boolean> {
  saveMasterAbteilungen(abteilungen);
  try {
    const res = await fetch('/api/master/abteilungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abteilungen })
    });
    return res.ok;
  } catch (err) {
    console.warn('[API] Failed to save abteilungen on server:', err);
    return false;
  }
}

// Import contacts to server
export async function importContactsApi(imported: Contact[], mode: 'replace' | 'merge'): Promise<{ contacts: Contact[]; isServerConnected: boolean }> {
  try {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: imported, mode })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.contacts) {
        saveContactsToStorage(data.contacts);
        return { contacts: data.contacts, isServerConnected: true };
      }
    }
  } catch (err) {
    console.warn('[API] Failed to import contacts to server:', err);
  }

  let current = loadContactsFromStorage();
  if (mode === 'replace') {
    current = imported;
  } else {
    const existingIds = new Set(current.map((c) => c.id));
    const existingKeys = new Set(
      current.map((c) => `${(c.vorname || '').toLowerCase().trim()}|${(c.nachname || '').toLowerCase().trim()}|${(c.standort || '').toLowerCase().trim()}`)
    );
    const newItems = imported.filter((c) => {
      const key = `${(c.vorname || '').toLowerCase().trim()}|${(c.nachname || '').toLowerCase().trim()}|${(c.standort || '').toLowerCase().trim()}`;
      return !existingIds.has(c.id) && !existingKeys.has(key);
    });
    current = [...newItems, ...current];
  }
  saveContactsToStorage(current);
  return { contacts: current, isServerConnected: false };
}
