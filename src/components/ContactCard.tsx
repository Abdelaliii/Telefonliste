import React from 'react';
import { 
  Phone, 
  Smartphone, 
  Mail, 
  Edit3, 
  Trash2, 
  QrCode, 
  Star, 
  Copy, 
  MapPin, 
  Building, 
  DoorOpen 
} from 'lucide-react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onOpenVCard: (contact: Contact) => void;
  onCopy: (text: string, label: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenVCard,
  onCopy,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group print-shadow-none">
      <div>
        
        {/* Top bar: Name, Position, Location badge, Star */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-900 transition">
              {contact.nachname}, {contact.vorname}
            </h3>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">
              {contact.position || 'Mitarbeiter'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(contact.id)}
              className="p-1 rounded-lg hover:bg-slate-100 transition no-print"
              title={contact.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Star
                className={`w-4 h-4 ${
                  contact.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300 group-hover:text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Location & Department Pill */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
            <MapPin className="w-3 h-3 text-blue-500" />
            {contact.standort}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
            <Building className="w-3 h-3 text-slate-400" />
            {contact.abteilung || 'Allgemein'}
          </span>
          {contact.raum && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60">
              <DoorOpen className="w-3 h-3 text-slate-400" />
              {contact.raum}
            </span>
          )}
        </div>

        {/* Phone & Email Info Box */}
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-mono">
          
          {/* Festnetz */}
          <div className="flex items-center justify-between group/line">
            <a
              href={`tel:${contact.festnetz}`}
              className="flex items-center gap-2 text-slate-800 hover:text-blue-600 font-semibold transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{contact.festnetz}</span>
            </a>
            <button
              onClick={() => onCopy(contact.festnetz, 'Festnetznummer')}
              className="opacity-0 group-hover/line:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 no-print"
              title="Nummer kopieren"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

          {/* Mobil */}
          {contact.mobil && (
            <div className="flex items-center justify-between group/line">
              <a
                href={`tel:${contact.mobil}`}
                className="flex items-center gap-2 text-slate-800 hover:text-emerald-600 font-medium transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{contact.mobil}</span>
              </a>
              <button
                onClick={() => onCopy(contact.mobil!, 'Mobilnummer')}
                className="opacity-0 group-hover/line:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 no-print"
                title="Nummer kopieren"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Email */}
          <div className="flex items-center justify-between group/line font-sans">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition truncate max-w-[200px]"
              title={contact.email}
            >
              <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
            <button
              onClick={() => onCopy(contact.email, 'Email-Adresse')}
              className="opacity-0 group-hover/line:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 no-print shrink-0"
              title="Email kopieren"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Notes callout */}
        {contact.notizen && (
          <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 italic">
            {contact.notizen}
          </div>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 no-print text-xs">
        <button
          onClick={() => onOpenVCard(contact)}
          className="px-2.5 py-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition font-medium flex items-center gap-1"
          title="vCard & QR-Code anzeigen"
        >
          <QrCode className="w-3.5 h-3.5 text-purple-600" />
          <span>vCard</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg transition font-medium flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Bearbeiten</span>
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition"
            title="Kontakt löschen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
