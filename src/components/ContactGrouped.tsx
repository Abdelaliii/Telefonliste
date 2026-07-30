import React, { useState } from 'react';
import { MapPin, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { Contact } from '../types';
import { ContactTable } from './ContactTable';

interface ContactGroupedProps {
  contacts: Contact[];
  isUnlocked: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onOpenVCard: (contact: Contact) => void;
  onCopy: (text: string, label: string) => void;
}

export const ContactGrouped: React.FC<ContactGroupedProps> = ({
  contacts,
  isUnlocked,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenVCard,
  onCopy,
}) => {
  // Group contacts by standort
  const groups = contacts.reduce((acc, contact) => {
    const key = contact.standort || 'Ohne Standort';
    if (!acc[key]) acc[key] = [];
    acc[key].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  const groupKeys = Object.keys(groups).sort();

  // Collapsed sections state (default all expanded)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {groupKeys.map((standort) => {
        const groupContacts = groups[standort];
        const isCollapsed = collapsed[standort];

        return (
          <div key={standort} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-shadow-none">
            
            {/* Group Header Bar */}
            <div 
              onClick={() => toggleGroup(standort)}
              className="bg-slate-900 text-white p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition select-none"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold tracking-tight">{standort}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 ml-2">
                  <Users className="w-3 h-3" />
                  {groupContacts.length} {groupContacts.length === 1 ? 'Kontakt' : 'Kontakte'}
                </span>
              </div>

              <div className="text-slate-400 hover:text-white transition">
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Group Content */}
            {!isCollapsed && (
              <div className="p-1">
                <ContactTable
                  contacts={groupContacts}
                  sortField="nachname"
                  sortOrder="asc"
                  isUnlocked={isUnlocked}
                  onSort={() => {}}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFavorite={onToggleFavorite}
                  onOpenVCard={onOpenVCard}
                  onCopy={onCopy}
                />
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};
