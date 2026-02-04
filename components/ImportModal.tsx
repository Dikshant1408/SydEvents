
import React, { useState } from 'react';

interface ImportModalProps {
  eventName: string;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ eventName, onClose, onSubmit }) => {
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Import to Platform</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-slate-600 mb-6 font-medium">
            You are about to publish <span className="text-indigo-600">"{eventName}"</span> to the main discovery feed.
          </p>

          <div className="mb-8">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Optional Notes</label>
            <textarea 
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none text-slate-700 transition-all"
              placeholder="Internal notes for this event..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors border border-slate-100"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSubmit(notes)}
              className="px-6 py-3 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              Confirm Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
