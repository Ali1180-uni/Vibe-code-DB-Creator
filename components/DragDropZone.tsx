import React, { useCallback, useState } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndPassFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PNG or JPG image.");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer flex flex-col items-center justify-center 
        w-full h-full rounded-xl border-2 border-dashed transition-all duration-300
        ${isDragging 
          ? 'border-cyan-400 bg-cyan-900/10 scale-[0.99]' 
          : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50'
        }
      `}
    >
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center space-y-4 text-center p-6">
        <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'}`}>
          {isDragging ? <FileImage size={48} /> : <Upload size={48} />}
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-medium text-slate-200">
            {isDragging ? "Drop your diagram here" : "Upload ER Diagram"}
          </p>
          <p className="text-sm text-slate-500">
            Drag & drop or click to browse (PNG, JPG)
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-max flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-full border border-red-900/50 animate-bounce">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default DragDropZone;