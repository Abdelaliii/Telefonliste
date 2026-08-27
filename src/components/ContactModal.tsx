import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, MapPin, Phone, Smartphone, Mail, DoorOpen, FileText } from 'lucide-react';
import { Contact } from '../types';
import { STANDORTE_INITIAL, ABTEILUNGEN_INITIAL } from '../data/initialContacts';

interface ContactModalProps {
  isOpen: boolean;
  editingContact: Contact | null;
  allStandorte: string[];
  allAbteilungen: string[];
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id'> & { id?: string }) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  editingContact,
  allStandorte,
  allAbteilungen,
  onClose,
  onSave,
}) => {
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [standort, setStandort] = useState('');
  const [position, setPosition] = useState('');
  const [abteilung, setAbteilung] = useState('');
  const [festnetz, setFestnetz] = useState('');
  const [mobil, setMobil] = useState('');
  const [email, setEmail] = useState('');
  const [raum, setRaum] = useState('');
  const [notizen, setNotizen] = useState('');
  const [eintrittDatum, setEintrittDatum] = useState('');
  const [austrittDatum, setAustrittDatum] = useState('');

  // Combine default suggestions with user's current unique locations & departments
  const locationList = Array.from(new Set([...STANDORTE_INITIAL, ...allStandorte])).sort();
  const departmentList = Array.from(new Set([...ABTEILUNGEN_INITIAL, ...allAbteilungen])).sort();

  useEffect(() => {
    if (editingContact) {
      setVorname(editingContact.vorname || '');
      setNachname(editingContact.nachname || '');
      setStandort(editingContact.standort || '');
      setPosition(editingContact.position || '');
      setAbteilung(editingContact.abteilung || '');
      setFestnetz(editingContact.festnetz || '');
      setMobil(editingContact.mobil || '');
      setEmail(editingContact.email || '');
      setRaum(editingContact.raum || '');
      setNotizen(editingContact.notizen || '');
      setEintrittDatum(editingContact.eintrittDatum || '');
      setAustrittDatum(editingContact.austrittDatum || '');
    } else {
      setVorname('');
      setNachname('');
      setStandort(locationList[0] || 'Rathaus Hauptgebäude');
      setPosition('');
      setAbteilung('');
      setFestnetz('');
      setMobil('');
      setEmail('');
      setRaum('');
      setNotizen('');
      setEintrittDatum('');
      setAustrittDatum('');
    }
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingContact?.id,
      vorname: vorname.trim(),
      nachname: nachname.trim(),
      standort: standort.trim(),
      position: position.trim(),
      abteilung: abteilung.trim(),
      festnetz: festnetz.trim(),
      mobil: mobil.trim(),
      email: email.trim(),
      raum: raum.trim(),
      notizen: notizen.trim(),
      eintrittDatum: eintrittDatum.trim(),
      austrittDatum: austrittDatum.trim(),
      isFavorite: editingContact?.isFavorite || false,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingContact ? 'Kontakt bearbeiten' : 'Neuen Kontakt anlegen'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingContact ? 'Ändere die Kontaktdaten und speichere die Aktualisierung' : 'Füge eine neue Person oder ein Amt hinzu'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Vorname & Nachname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vorname *
              </label>
              <input
                type="text"
                required
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                placeholder="z.B. Maria"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nachname *
              </label>
              <input
                type="text"
                required
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
                placeholder="z.B. Schmidt"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Standort */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              Standort / Gebäude *
            </label>
            <input
              type="text"
              required
              list="standorte-modal-list"
              value={standort}
              onChange={(e) => setStandort(e.target.value)}
              placeholder="z.B. Rathaus Hauptgebäude oder Bürgerbüro"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <datalist id="standorte-modal-list">
              {locationList.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          {/* Position & Abteilung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Position / Rolle *
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="z.B. Sachgebietsleiter"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Abteilung / Amt *
              </label>
              <input
                type="text"
                required
                list="abteilungen-modal-list"
                value={abteilung}
                onChange={(e) => setAbteilung(e.target.value)}
                placeholder="z.B. Bürgerservice & Ordnung"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <datalist id="abteilungen-modal-list">
                {departmentList.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Festnetz & Mobil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                Festnetznummer (optional)
              </label>
              <input
                type="text"

                value={festnetz}
                onChange={(e) => setFestnetz(e.target.value)}
                placeholder="0221 500-123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                Mobilnummer (optional)
              </label>
              <input
                type="text"
                value={mobil}
                onChange={(e) => setMobil(e.target.value)}
                placeholder="0171 1234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Email & Raum */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                Email-Adresse *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.schmidt@verwaltung.de"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                Raum / Büro
              </label>
              <input
                type="text"
                value={raum}
                onChange={(e) => setRaum(e.target.value)}
                placeholder="Raum 102 (1. OG)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Eintritt ab & Austritt ab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eintritt ab (optional)
              </label>
              <input
                type="date"
                value={eintrittDatum}
                onChange={(e) => setEintrittDatum(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Austritt ab (optional)
              </label>
              <input
                type="date"
                value={austrittDatum}
                onChange={(e) => setAustrittDatum(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notizen / Sprechzeiten / Besonderheiten
            </label>
            <textarea
              rows={2}
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              placeholder="z.B. Sprechzeiten Mo-Fr 08:00 - 12:00 Uhr oder Vertreter für Amt 20..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-900/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Speichern</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
