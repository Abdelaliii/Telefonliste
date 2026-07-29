import React from 'react';
import { ContactCard } from './ContactCard';
import { Contact } from '../types';

interface ContactGridProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onOpenVCard: (contact: Contact) => void;
  onCopy: (text: string, label: string) => void;
}

export const ContactGrid: React.FC<ContactGridProps> = ({
  contacts,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenVCard,
  onCopy,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onOpenVCard={onOpenVCard}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
};
