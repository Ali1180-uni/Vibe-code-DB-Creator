import React, { useState, useEffect } from 'react';
import { X, Key, Save, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    onSave(apiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#151F32] border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Key className="text-cyan-400" size={20} />
            <h2 className="text-slate-200 font-semibold">API Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Google Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
            />
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-2">
            <p>
              To use real AI generation, you need a valid API key. 
              The key is stored locally in your browser.
            </p>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
            >
              Get an API Key <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;