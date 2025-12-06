import React, { useState, useEffect } from 'react';
import { MessageSquare, FileCode, Zap, Layers, ChevronDown, Database, Upload, ArrowRight } from 'lucide-react';
import DragDropZone from './components/DragDropZone';
import CodeEditor from './components/CodeEditor';
import ConsultantSidebar from './components/ConsultantSidebar';
import { WorkflowStage, Message, DatabaseDialect } from './types';
import { ENHANCED_CODE_BY_DIALECT, RAW_CODE_BY_DIALECT } from './constants';
import { convertImageToSqlMock, initChat } from './services/geminiService';

const App = () => {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>(WorkflowStage.UPLOAD);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dialect, setDialect] = useState<DatabaseDialect>('PostgreSQL');
  const [useEnhancedMode, setUseEnhancedMode] = useState<boolean>(true);

  useEffect(() => {
    // Initialize Gemini Chat on mount
    initChat();
  }, []);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  // --- Step 1: Analysis & Proposal ---
  const handleFileSelect = async (file: File) => {
    // 1. Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // 2. Start Analysis
    setWorkflowStage(WorkflowStage.ANALYZING);
    await convertImageToSqlMock(file); // Simulate 2s delay

    // 3. Transition to Review
    setWorkflowStage(WorkflowStage.REVIEW);
    setChatOpen(true);

    const analysisMsg: Message = {
      id: Date.now().toString(),
      role: 'model',
      text: "I've analyzed your diagram. It looks like a valid schema, but I found some optimization opportunities (e.g., missing Foreign Keys, inconsistent naming).\n\nDo you want to proceed with my **Nano Banana Enhanced** version, or stick to your **Original** diagram?",
      timestamp: new Date(),
      action: {
        type: 'BUTTON',
        options: [
          { label: 'Use Enhanced (Nano Banana)', value: 'enhanced', style: 'primary' },
          { label: 'Stick to Original', value: 'original', style: 'secondary' }
        ]
      }
    };
    addMessage(analysisMsg);
  };

  // --- Step 2: The Decision ---
  const handleReviewDecision = (decision: string) => {
    const isEnhanced = decision === 'enhanced';
    setUseEnhancedMode(isEnhanced);
    
    // Add user response to chat history visually
    const userResp: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: isEnhanced ? "Let's use the Enhanced version." : "Stick to the original.",
      timestamp: new Date()
    };
    addMessage(userResp);

    // Transition to Format Select
    setWorkflowStage(WorkflowStage.FORMAT_SELECT);

    const recommendationMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: "Great choice. Based on the relational structure (Users, Orders), I recommend **PostgreSQL**.\n\nWhich database would you like to generate code for?",
      timestamp: new Date(),
      action: {
        type: 'SELECT',
        placeholder: 'Select Target Database...',
        options: [
          { label: 'PostgreSQL (Recommended)', value: 'PostgreSQL' },
          { label: 'MySQL', value: 'MySQL' },
          { label: 'SQL Server', value: 'SQL Server' },
          { label: 'SQLite', value: 'SQLite' },
          { label: 'MongoDB', value: 'MongoDB' },
          { label: 'Prisma ORM', value: 'Prisma' },
        ]
      }
    };
    
    // Small delay to make it feel natural
    setTimeout(() => addMessage(recommendationMsg), 600);
  };

  // --- Step 3: Database Selection & Generation ---
  const handleDatabaseSelection = async (selectedDialect: string) => {
    const db = selectedDialect as DatabaseDialect;
    setDialect(db);

    // Add user response
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      text: `Generate for ${db}`,
      timestamp: new Date()
    });

    // Transition to Generating
    setWorkflowStage(WorkflowStage.GENERATING);

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // --- Step 4: Final Output ---
    const finalCode = useEnhancedMode 
      ? ENHANCED_CODE_BY_DIALECT[db] 
      : RAW_CODE_BY_DIALECT[db];
    
    setCode(finalCode);
    setWorkflowStage(WorkflowStage.DONE);

    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: `Done! Here is the ${useEnhancedMode ? 'optimized' : 'raw'} ${db} schema. You can copy or download it from the main panel.`,
      timestamp: new Date()
    });
  };

  const handleActionClick = (value: string) => {
    if (workflowStage === WorkflowStage.REVIEW) {
      handleReviewDecision(value);
    } else if (workflowStage === WorkflowStage.FORMAT_SELECT) {
      handleDatabaseSelection(value);
    }
  };

  const clearSession = () => {
    setImagePreview(null);
    setWorkflowStage(WorkflowStage.UPLOAD);
    setCode('');
    setMessages([]);
    setUseEnhancedMode(true);
  };

  // Handle manual dialect change in header after generation
  const handleManualDialectChange = (newDialect: DatabaseDialect) => {
    setDialect(newDialect);
    if (workflowStage === WorkflowStage.DONE) {
       setCode(useEnhancedMode ? ENHANCED_CODE_BY_DIALECT[newDialect] : RAW_CODE_BY_DIALECT[newDialect]);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* Navbar */}
      <nav className="flex-none h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="text-white" size={18} />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-100">
            VisionDB Architect
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium
              ${chatOpen 
                ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}
            `}
          >
            <MessageSquare size={14} />
            <span>AI Consultant</span>
            {messages.length > 0 && !chatOpen && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            )}
          </button>
          
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 text-xs font-bold">
            TS
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: Image / Upload */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0F172A]/30">
           {/* Panel Header */}
           <div className="flex-none h-12 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Zap size={14} className="text-cyan-500" /> Source Diagram
              </h2>
              {imagePreview && (
                <button 
                  onClick={clearSession}
                  className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Upload size={12} /> New Upload
                </button>
              )}
           </div>

           {/* Panel Content */}
           <div className="flex-1 overflow-auto p-4 relative flex items-center justify-center bg-[#0B1221]">
              {imagePreview ? (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded Diagram" 
                    className="max-w-full max-h-full object-contain shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-full max-w-xl max-h-[400px]">
                  <DragDropZone onFileSelect={handleFileSelect} />
                </div>
              )}
           </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0F172A]">
           {/* Panel Header */}
           <div className="flex-none h-12 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <FileCode size={14} className="text-cyan-500" /> Generated Code
              </h2>
              
              <div className="flex items-center gap-3">
                {workflowStage === WorkflowStage.DONE && (
                  <>
                    <span className={`hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${useEnhancedMode ? 'text-green-400 bg-green-900/20 border-green-900/50' : 'text-orange-400 bg-orange-900/20 border-orange-900/50'}`}>
                      {useEnhancedMode ? 'Optimized' : 'Raw Output'}
                    </span>
                    <div className="relative group">
                      <select 
                        value={dialect}
                        onChange={(e) => handleManualDialectChange(e.target.value as DatabaseDialect)}
                        className="appearance-none bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded pl-2 pr-7 py-1 focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-slate-900 transition-colors font-medium"
                      >
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="MySQL">MySQL</option>
                        <option value="SQLite">SQLite</option>
                        <option value="SQL Server">SQL Server</option>
                        <option value="MongoDB">MongoDB</option>
                        <option value="Prisma">Prisma</option>
                      </select>
                      <Database size={12} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none opacity-0" />
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300" />
                    </div>
                  </>
                )}
              </div>
           </div>

           {/* Editor Content */}
           <div className="flex-1 overflow-hidden relative">
              <CodeEditor 
                code={code} 
                stage={workflowStage}
                dialect={dialect}
              />
           </div>
        </div>

        {/* Consultant Sidebar */}
        <ConsultantSidebar 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          messages={messages}
          addMessage={addMessage}
          onActionClick={handleActionClick}
        />

      </main>
    </div>
  );
};

export default App;