import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink, Trash2 } from 'lucide-react';
import { WELCOME_MSG } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  canClose: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, canClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    onSave(apiKey);
    if (canClose) onClose();
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    onSave(''); // Propagate clear
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#151F32] border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Key className="text-cyan-400" size={20} />
            <h2 className="text-slate-200 font-semibold">{canClose ? 'API Settings' : 'Welcome to VisionDB'}</h2>
          </div>
          {canClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!canClose && (
            <div className="bg-cyan-900/20 border border-cyan-800 rounded-lg p-3">
              <p className="text-sm text-cyan-200 leading-relaxed">
                {WELCOME_MSG}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Google Gemini API Key</label>
            <div className="flex gap-2">
                <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                />
                {canClose && (
                    <button 
                        onClick={handleClear}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-900/50 transition-colors"
                        title="Clear Key"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-xs text-slate-400 flex flex-col gap-2">
            <p>
                VisionDB uses the <strong>Gemini 2.5 Flash</strong> model for analysis and <strong>Nano Banana</strong> for visualization.
            </p>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:underline w-fit"
            >
              Get a Free API Key <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Save size={16} />
            {canClose ? 'Save Configuration' : 'Start Architect'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;