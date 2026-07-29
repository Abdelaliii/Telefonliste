import React, { useState } from 'react';
import { X, Download, QrCode, Copy, Check } from 'lucide-react';
import { Contact } from '../types';
import { generateVCard } from '../lib/storage';

interface VCardModalProps {
  contact: Contact | null;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}

export const VCardModal: React.FC<VCardModalProps> = ({ contact, onClose, onCopy }) => {
  const [copied, setCopied] = useState(false);

  if (!contact) return null;

  const vCardString = generateVCard(contact);

  // Generate QR Code image URL via public QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    vCardString
  )}`;

  const handleDownloadVCard = () => {
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.nachname}_${contact.vorname}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyVCard = () => {
    onCopy(vCardString, 'vCard-Text');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Visitenkarte & QR-Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-4 text-center">
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              {contact.vorname} {contact.nachname}
            </h4>
            <p className="text-xs font-semibold text-blue-600">{contact.position}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {contact.standort} · {contact.abteilung}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner mx-auto">
            <img
              src={qrCodeUrl}
              alt={`QR Code Visitenkarte für ${contact.vorname} ${contact.nachname}`}
              className="w-44 h-44 rounded-lg mix-blend-multiply"
              loading="lazy"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Mit dem Smartphone scannen, um Kontakt direkt im Telefonbuch zu speichern
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleDownloadVCard}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/10 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>vCard-Datei herunterladen (.vcf)</span>
            </button>

            <button
              onClick={handleCopyVCard}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'In Zwischenablage kopiert!' : 'vCard Text kopieren'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
