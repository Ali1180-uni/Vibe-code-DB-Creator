import React from 'react';
import { Copy, Download, Check, Loader2 } from 'lucide-react';
import { DatabaseDialect, WorkflowStage } from '../types';

interface CodeEditorProps {
  code: string;
  stage: WorkflowStage;
  dialect: DatabaseDialect;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, stage, dialect }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = dialect === 'MongoDB' ? 'js' : dialect === 'Prisma' ? 'prisma' : 'sql';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading / Processing State
  if (stage === WorkflowStage.ANALYZING || stage === WorkflowStage.GENERATING) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-6 text-slate-400 bg-[#0F172A]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 size={24} className="text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
            <p className="font-mono text-sm tracking-widest uppercase text-cyan-400">
                {stage === WorkflowStage.ANALYZING ? 'Analyzing Diagram' : 'Generating Code'}
            </p>
            <p className="text-xs text-slate-600">
                {stage === WorkflowStage.ANALYZING ? 'Extracting entities & relationships...' : 'Applying dialect specific formatting...'}
            </p>
        </div>
      </div>
    );
  }

  // Waiting for Decision State
  if (stage === WorkflowStage.REVIEW || stage === WorkflowStage.FORMAT_SELECT) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 bg-[#0F172A] p-8 text-center">
            <div className="w-full max-w-md bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-950/50 flex items-center justify-center mb-4 text-cyan-400 animate-pulse">
                    <Loader2 size={24} />
                </div>
                <h3 className="text-slate-200 font-medium mb-2">Awaiting Feedback</h3>
                <p className="text-sm text-slate-400">
                    Please check the AI Consultant sidebar to review the analysis and select your target database.
                </p>
            </div>
        </div>
    );
  }

  // Idle State
  if (!code || stage === WorkflowStage.UPLOAD) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 bg-[#0F172A]">
        <div className="p-4 rounded-full bg-slate-900/50 mb-4">
            <div className="w-8 h-8 border-2 border-dashed border-slate-700 rounded opacity-50"></div>
        </div>
        <p className="font-mono text-xs">Waiting for diagram...</p>
      </div>
    );
  }

  const isMongo = dialect === 'MongoDB';
  const extension = isMongo ? 'js' : dialect === 'Prisma' ? 'prisma' : 'sql';
  const fileName = `schema.${extension}`;

  return (
    <div className="flex flex-col h-full w-full bg-[#0F172A]">
      {/* Code Area */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {/* Floating Actions */}
        <div className="sticky top-0 z-10 flex justify-between items-start p-4 pointer-events-none">
           <span className="text-xs font-mono text-slate-500 select-none bg-slate-900/90 backdrop-blur px-2 py-1 rounded border border-slate-800">
             {fileName}
           </span>
           <div className="flex items-center space-x-1 pointer-events-auto bg-slate-900/90 backdrop-blur p-1 rounded-lg border border-slate-800 shadow-xl">
            <button 
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/50 rounded transition-colors"
              title="Copy"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
            <button 
              onClick={handleDownload}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/50 rounded transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-8 -mt-12 pt-14 min-w-max">
            <pre className="font-mono text-[13px] leading-6 text-slate-300">
            <code>
                {code.split('\n').map((line, i) => (
                <div key={i} className="table-row hover:bg-slate-800/30 transition-colors">
                    <span className="table-cell text-right pr-6 text-slate-700 select-none w-10 text-[11px] align-top py-[1px]">{i + 1}</span>
                    <span className="table-cell whitespace-pre align-top py-[1px]">
                    {highlightSyntax(line, dialect)}
                    </span>
                </div>
                ))}
            </code>
            </pre>
        </div>
      </div>
    </div>
  );
};

// Visual highlighter
const highlightSyntax = (line: string, dialect: DatabaseDialect) => {
  if (dialect === 'MongoDB') return highlightMongo(line);
  if (dialect === 'Prisma') return highlightPrisma(line);
  return highlightSql(line);
};

const highlightSql = (line: string) => {
  const keywords = ['CREATE', 'TABLE', 'ALTER', 'ADD', 'FOREIGN', 'KEY', 'REFERENCES', 'INDEX', 'ON', 'DEFAULT', 'NOT', 'NULL', 'UNIQUE', 'PRIMARY', 'CHECK', 'CONSTRAINT', 'IDENTITY', 'AUTO_INCREMENT', 'ENGINE', 'InnoDB', 'GO', 'USE', 'IF', 'EXISTS', 'ASC', 'DESC'];
  const types = ['SERIAL', 'VARCHAR', 'INTEGER', 'INT', 'DECIMAL', 'TEXT', 'TIMESTAMP', 'BOOLEAN', 'DATETIME', 'REAL', 'NVARCHAR', 'MAX', 'BIT', 'FLOAT', 'DOUBLE', 'NUMERIC'];
  
  const words = line.split(/(\s+|[(),;`[\]])/); 
  
  return words.map((word, idx) => {
    const upper = word.toUpperCase();
    if (keywords.includes(upper)) {
      return <span key={idx} className="text-cyan-400 font-semibold">{word}</span>;
    }
    if (types.includes(upper) || upper.startsWith('VARCHAR') || upper.startsWith('DECIMAL')) {
      return <span key={idx} className="text-yellow-400">{word}</span>;
    }
    if (word.startsWith('"') || word.startsWith("'") || word.startsWith('`') || (word.startsWith('[') && word.endsWith(']'))) {
      return <span key={idx} className="text-green-400">{word}</span>;
    }
    if (word.startsWith('--') || word.startsWith('/*')) {
      return <span key={idx} className="text-slate-500 italic">{word}</span>;
    }
    return <span key={idx}>{word}</span>;
  });
};

const highlightMongo = (line: string) => {
  const keywords = ['const', 'new', 'require', 'module', 'exports'];
  const types = ['String', 'Number', 'Date', 'Boolean', 'ObjectId', 'Schema', 'mongoose'];
  const props = ['type', 'required', 'unique', 'default', 'ref', 'timestamps', 'enum', 'min', 'max'];

  const words = line.split(/(\s+|[(),;:{}[\]])/);

  return words.map((word, idx) => {
    if (keywords.includes(word)) {
      return <span key={idx} className="text-purple-400 font-semibold">{word}</span>;
    }
    if (types.includes(word) || word.includes('Schema')) {
      return <span key={idx} className="text-yellow-400">{word}</span>;
    }
    if (props.includes(word)) {
      return <span key={idx} className="text-cyan-400">{word}</span>;
    }
    if (word.startsWith("'") || word.startsWith('"')) {
      return <span key={idx} className="text-green-400">{word}</span>;
    }
    if (word.startsWith('//')) {
      return <span key={idx} className="text-slate-500 italic">{word}</span>;
    }
    return <span key={idx}>{word}</span>;
  });
};

const highlightPrisma = (line: string) => {
  const keywords = ['model', 'generator', 'datasource', 'enum'];
  const types = ['Int', 'String', 'DateTime', 'Boolean', 'Decimal'];
  const decorators = ['@id', '@default', '@unique', '@relation', '@map', '@updatedAt', '@@map', '@@index'];

  const words = line.split(/(\s+|[(){}[\]])/);

  return words.map((word, idx) => {
    if (keywords.includes(word)) {
        return <span key={idx} className="text-cyan-400 font-semibold">{word}</span>;
    }
    if (types.includes(word)) {
        return <span key={idx} className="text-yellow-400">{word}</span>;
    }
    if (decorators.some(d => word.startsWith(d))) {
        return <span key={idx} className="text-purple-400">{word}</span>;
    }
    if (word.startsWith('"')) {
        return <span key={idx} className="text-green-400">{word}</span>;
    }
    if (word.startsWith('//')) {
        return <span key={idx} className="text-slate-500 italic">{word}</span>;
    }
    return <span key={idx}>{word}</span>;
  });
};

export default CodeEditor;