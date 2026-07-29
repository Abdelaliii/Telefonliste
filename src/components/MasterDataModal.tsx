import React, { useState } from 'react';
import { X, Building2, Layers, Plus, Trash2, Edit3, Check, Search, AlertCircle } from 'lucide-react';

interface MasterDataModalProps {
  isOpen: boolean;
  standorte: string[];
  abteilungen: string[];
  onClose: () => void;
  onAddStandort: (name: string) => void;
  onUpdateStandort: (oldName: string, newName: string) => void;
  onDeleteStandort: (name: string) => void;
  onAddAbteilung: (name: string) => void;
  onUpdateAbteilung: (oldName: string, newName: string) => void;
  onDeleteAbteilung: (name: string) => void;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  isOpen,
  standorte,
  abteilungen,
  onClose,
  onAddStandort,
  onUpdateStandort,
  onDeleteStandort,
  onAddAbteilung,
  onUpdateAbteilung,
  onDeleteAbteilung,
}) => {
  const [activeTab, setActiveTab] = useState<'standorte' | 'abteilungen'>('standorte');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New entry input
  const [newItemName, setNewItemName] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const currentList = activeTab === 'standorte' ? standorte : abteilungen;
  const filteredList = currentList.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    if (activeTab === 'standorte') {
      onAddStandort(trimmed);
    } else {
      onAddAbteilung(trimmed);
    }
    setNewItemName('');
  };

  const startEditing = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const saveEditing = (oldItem: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldItem) {
      setEditingItem(null);
      return;
    }

    if (activeTab === 'standorte') {
      onUpdateStandort(oldItem, trimmed);
    } else {
      onUpdateAbteilung(oldItem, trimmed);
    }
    setEditingItem(null);
  };

  const handleDelete = (item: string) => {
    if (confirm(`Möchten Sie "${item}" wirklich aus den Stammdaten löschen?`)) {
      if (activeTab === 'standorte') {
        onDeleteStandort(item);
      } else {
        onDeleteAbteilung(item);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Stammdaten-Verwaltung
              </h2>
              <p className="text-xs text-slate-500">
                Zentrale Pflege von Standorten und Abteilungen für hohe Datenqualität
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 mt-4">
          <button
            onClick={() => { setActiveTab('standorte'); setSearchQuery(''); }}
            className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-all ${
              activeTab === 'standorte'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Standorte ({standorte.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('abteilungen'); setSearchQuery(''); }}
            className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-all ${
              activeTab === 'abteilungen'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Abteilungen ({abteilungen.length})</span>
          </button>
        </div>

        {/* Form to Add New */}
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={
              activeTab === 'standorte'
                ? 'Neuen Standort hinzufügen (z. B. Standort Dresden)...'
                : 'Neue Abteilung hinzufügen (z. B. Arbeitssicherheit)...'
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Hinzufügen</span>
          </button>
        </form>

        {/* Search filter for list */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${activeTab === 'standorte' ? 'Standorte' : 'Abteilungen'} durchsuchen...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* List of Items */}
        <div className="mt-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 text-slate-300" />
              <span>Keine Einträge gefunden.</span>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 transition"
              >
                {editingItem === item ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1 rounded-lg border border-indigo-400 text-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditing(item)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition"
                      title="Speichern"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                      title="Abbrechen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-slate-800 font-medium">{item}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Bearbeiten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
