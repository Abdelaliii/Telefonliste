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
  ChevronUp, 
  ChevronDown,
  Building,
  MapPin,
  DoorOpen
} from 'lucide-react';
import { Contact, SortField, SortOrder } from '../types';

interface ContactTableProps {
  contacts: Contact[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onOpenVCard: (contact: Contact) => void;
  onCopy: (text: string, label: string) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenVCard,
  onCopy,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 inline ml-1 text-blue-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline ml-1 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="w-10 px-3 py-3.5 text-center no-print">⭐</th>
              <th 
                onClick={() => onSort('nachname')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200/60 transition select-none"
              >
                Name {renderSortIcon('nachname')}
              </th>
              <th 
                onClick={() => onSort('position')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200/60 transition select-none"
              >
                Position / Rolle {renderSortIcon('position')}
              </th>
              <th 
                onClick={() => onSort('standort')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200/60 transition select-none"
              >
                Standort / Abteilung {renderSortIcon('standort')}
              </th>
              <th 
                onClick={() => onSort('festnetz')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-200/60 transition select-none"
              >
                Festnetz {renderSortIcon('festnetz')}
              </th>
              <th className="px-4 py-3.5">Mobil</th>
              <th className="px-4 py-3.5">Email-Adresse</th>
              <th className="px-3 py-3.5 no-print text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 bg-white">
            {contacts.map((c) => (
              <tr 
                key={c.id} 
                className="hover:bg-blue-50/40 transition group"
              >
                {/* Favorite Star */}
                <td className="px-3 py-3.5 text-center no-print">
                  <button
                    onClick={() => onToggleFavorite(c.id)}
                    className="p-1 rounded hover:bg-slate-100 transition"
                    title={c.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        c.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                </td>

                {/* Name */}
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900 group-hover:text-blue-900">
                    {c.nachname}, {c.vorname}
                  </div>
                  {c.raum && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <DoorOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{c.raum}</span>
                    </div>
                  )}
                </td>

                {/* Position */}
                <td className="px-4 py-3.5">
                  <div className="font-medium text-slate-800 text-xs">{c.position || '-'}</div>
                  {c.notizen && (
                    <div className="text-[11px] text-slate-400 italic truncate max-w-[200px]" title={c.notizen}>
                      {c.notizen}
                    </div>
                  )}
                </td>

                {/* Standort / Abteilung */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
                      <MapPin className="w-3 h-3" />
                      {c.standort}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      {c.abteilung || '-'}
                    </span>
                  </div>
                </td>

                {/* Festnetz */}
                <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${c.festnetz}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold flex items-center gap-1"
                      title="Anrufen"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      {c.festnetz}
                    </a>
                    <button
                      onClick={() => onCopy(c.festnetz, 'Festnetznummer')}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 no-print"
                      title="Kopieren"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Mobil */}
                <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                  {c.mobil ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${c.mobil}`}
                        className="text-emerald-600 hover:text-emerald-800 hover:underline font-medium flex items-center gap-1"
                        title="Anrufen"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                        {c.mobil}
                      </a>
                      <button
                        onClick={() => onCopy(c.mobil, 'Mobilnummer')}
                        className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 no-print"
                        title="Kopieren"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Email */}
                <td className="px-4 py-3.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`mailto:${c.email}`}
                      className="text-slate-700 hover:text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[220px]"
                      title={`E-Mail an ${c.email}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </a>
                    <button
                      onClick={() => onCopy(c.email, 'Email-Adresse')}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 no-print shrink-0"
                      title="Kopieren"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 py-3.5 text-right no-print whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onOpenVCard(c)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="vCard & QR-Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Kontakt bearbeiten"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Kontakt löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
