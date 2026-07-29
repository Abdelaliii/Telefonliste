import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Contact } from '../types';

interface DeleteConfirmModalProps {
  contact: Contact | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  contact,
  onClose,
  onConfirm,
}) => {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold">Kontakt löschen</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-700">
            Möchten Sie den folgenden Kontakt wirklich unwiderruflich aus dem Telefonverzeichnis löschen?
          </p>

          <div className="bg-red-50/70 border border-red-200/80 p-3.5 rounded-xl text-xs space-y-1">
            <div className="font-bold text-red-950 text-sm">
              {contact.nachname}, {contact.vorname}
            </div>
            <div className="text-red-800 font-medium">{contact.position}</div>
            <div className="text-red-700/80">
              {contact.standort} · {contact.abteilung}
            </div>
            <div className="text-red-900 font-mono pt-1">Tel: {contact.festnetz}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onConfirm(contact.id)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-red-900/20 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Endgültig löschen</span>
          </button>
        </div>

      </div>
    </div>
  );
};
