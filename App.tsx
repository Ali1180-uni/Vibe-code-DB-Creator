import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, FileCode, Zap, Layers, ChevronDown, Upload, Wand2, Settings, AlertTriangle } from 'lucide-react';
import DragDropZone from './components/DragDropZone';
import CodeEditor from './components/CodeEditor';
import ConsultantSidebar from './components/ConsultantSidebar';
import SettingsModal from './components/SettingsModal';
import { WorkflowStage, Message, DatabaseDialect } from './types';
import { initChat, updateApiKey, generateSqlFromImage, generateEnhancedDiagram, analyzeDiagram } from './services/geminiService';

const App = () => {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>(WorkflowStage.UPLOAD);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [code, setCode] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dialect, setDialect] = useState<DatabaseDialect>('PostgreSQL');
  const [useEnhancedMode, setUseEnhancedMode] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Initialization & Security ---
  useEffect(() => {
    const checkAuth = async () => {
      const authorized = await initChat();
      if (!authorized) {
        setIsSettingsOpen(true); // Force open if no key
        setHasApiKey(false);
      } else {
        setHasApiKey(true);
      }
    };
    checkAuth();
  }, []);

  const handleApiKeySave = (key: string) => {
    updateApiKey(key);
    if (key) {
        setHasApiKey(true);
        setIsSettingsOpen(false);
        initChat(); // Re-init chat with new key
    } else {
        setHasApiKey(false);
        setIsSettingsOpen(true);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  // --- Workflow Step 1: Upload & Analysis ---
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setWorkflowStage(WorkflowStage.ANALYZING);

    try {
        await analyzeDiagram(file); // Lightweight check
        
        // Move to Review Phase
        setWorkflowStage(WorkflowStage.REVIEW);
        setChatOpen(true);
        addMessage({
            id: Date.now().toString(),
            role: 'model',
            text: "I've analyzed your diagram. I can extract the schema as-is, or use the 'Nano Banana' model to redraw and optimize the structure (add Foreign Keys, fix naming).\n\nHow should we proceed?",
            timestamp: new Date(),
            action: {
                type: 'BUTTON',
                options: [
                { label: 'Use Enhanced (Nano Banana)', value: 'enhanced', style: 'primary' },
                { label: 'Stick to Original', value: 'original', style: 'secondary' }
                ]
            }
        });
    } catch (e) {
        console.error(e);
        setWorkflowStage(WorkflowStage.UPLOAD);
        showToast("Error processing image. Check API Key permissions.");
    }
  };

  // --- Workflow Step 2: Enhancement Decision ---
  const handleReviewDecision = async (decision: string) => {
    if (decision === 'original') {
      setUseEnhancedMode(false);
      setShowEnhancedPreview(false);
      triggerDatabaseSelection();
    } else {
      setWorkflowStage(WorkflowStage.SIMULATING_ENHANCEMENT);
      addMessage({ id: Date.now().toString(), role: 'user', text: "Enhance it.", timestamp: new Date() });

      if (uploadedFile) {
        // Real API Call
        const generatedUrl = await generateEnhancedDiagram(uploadedFile);
        
        if (generatedUrl) {
            setEnhancedImage(generatedUrl);
            setShowEnhancedPreview(true);
            setWorkflowStage(WorkflowStage.DIAGRAM_APPROVAL);
            addMessage({
                id: Date.now().toString(),
                role: 'model',
                text: "I've visualized the optimized schema. Do you want to generate code from this improved version?",
                timestamp: new Date(),
                action: {
                  type: 'BUTTON',
                  options: [
                    { label: 'Approve & Generate Code', value: 'approve', style: 'primary' },
                    { label: 'Reject & Return to Original', value: 'reject', style: 'secondary' }
                  ]
                }
            });
        } else {
            // Graceful Fallback if Image Gen fails (e.g. Safety Filters)
            showToast("Visual generation restricted by safety filters. Optimizing code only.");
            setUseEnhancedMode(true); // Still use enhanced logic for SQL
            triggerDatabaseSelection(); 
        }
      }
    }
  };

  // --- Workflow Step 2.5: Approval ---
  const handleDiagramApproval = (decision: string) => {
    if (decision === 'approve') {
      setUseEnhancedMode(true);
      setShowEnhancedPreview(true);
      triggerDatabaseSelection();
    } else {
      setUseEnhancedMode(false);
      setShowEnhancedPreview(false);
      triggerDatabaseSelection();
    }
  };

  // --- Workflow Step 3: DB Selection ---
  const triggerDatabaseSelection = () => {
    setWorkflowStage(WorkflowStage.FORMAT_SELECT);
    addMessage({
        id: Date.now().toString(),
        role: 'model',
        text: "Which database dialect should I target?",
        timestamp: new Date(),
        action: {
            type: 'SELECT',
            placeholder: 'Select Database...',
            options: [
                { label: 'PostgreSQL', value: 'PostgreSQL' },
                { label: 'MySQL', value: 'MySQL' },
                { label: 'SQL Server', value: 'SQL Server' },
                { label: 'SQLite', value: 'SQLite' },
                { label: 'MongoDB', value: 'MongoDB' },
                { label: 'Prisma ORM', value: 'Prisma' },
            ]
        }
    });
  };

  // --- Workflow Step 4: Generation ---
  const handleDatabaseSelection = async (selectedDialect: string) => {
    const db = selectedDialect as DatabaseDialect;
    setDialect(db);
    setWorkflowStage(WorkflowStage.GENERATING);

    if (uploadedFile) {
        try {
            const sql = await generateSqlFromImage(uploadedFile, db, useEnhancedMode);
            setCode(sql);
            setWorkflowStage(WorkflowStage.DONE);
            addMessage({
                id: Date.now().toString(),
                role: 'model',
                text: `Generation complete for ${db}.`,
                timestamp: new Date()
            });
        } catch (e) {
            showToast("Failed to generate SQL. Please try again.");
            setWorkflowStage(WorkflowStage.FORMAT_SELECT);
        }
    }
  };

  const handleActionClick = (value: string) => {
    if (workflowStage === WorkflowStage.REVIEW) handleReviewDecision(value);
    else if (workflowStage === WorkflowStage.DIAGRAM_APPROVAL) handleDiagramApproval(value);
    else if (workflowStage === WorkflowStage.FORMAT_SELECT) handleDatabaseSelection(value);
  };

  const clearSession = () => {
    setImagePreview(null);
    setEnhancedImage(null);
    setUploadedFile(null);
    setWorkflowStage(WorkflowStage.UPLOAD);
    setCode('');
    setMessages([]);
    setUseEnhancedMode(true);
    setShowEnhancedPreview(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleApiKeySave}
        canClose={hasApiKey}
      />

      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-slate-800 border border-slate-600 text-slate-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-fade-in-down">
              <AlertTriangle size={18} className="text-amber-400" />
              <span className="text-sm">{toastMessage}</span>
          </div>
      )}
      
      {/* Navbar */}
      <nav className="flex-none h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="text-white" size={18} />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-100">
            VisionDB Architect <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2 font-mono">RC-1.1</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
             onClick={() => setIsSettingsOpen(true)}
             className="p-2 text-slate-400 hover:text-white transition-colors"
             title="API Settings"
          >
             <Settings size={18} />
          </button>
          
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0F172A]/30 transition-colors duration-500 relative">
           <div className={`flex-none h-12 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50 ${showEnhancedPreview ? 'border-b-cyan-900/50 bg-cyan-950/10' : ''}`}>
              <h2 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${showEnhancedPreview ? 'text-cyan-400' : 'text-slate-400'}`}>
                 {showEnhancedPreview ? (
                    <><Wand2 size={14} className="animate-pulse" /> Enhanced Diagram</>
                 ) : (
                    <><Zap size={14} /> Source Diagram</>
                 )}
              </h2>
              {imagePreview && (
                <button onClick={clearSession} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
                  <Upload size={12} /> New
                </button>
              )}
           </div>

           <div className="flex-1 overflow-auto p-4 relative flex items-center justify-center bg-[#0B1221]">
              {workflowStage === WorkflowStage.SIMULATING_ENHANCEMENT && (
                <div className="absolute inset-0 z-20 bg-[#0F172A]/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-cyan-500 border-r-cyan-500/30 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-cyan-400 animate-pulse mb-2">
                        Nano Banana is visualizing schema...
                    </p>
                </div>
              )}

              {imagePreview ? (
                <div className="w-full h-full flex items-center justify-center p-2 relative">
                  <img 
                    src={showEnhancedPreview ? (enhancedImage || imagePreview) : imagePreview} 
                    alt="Diagram" 
                    className={`max-w-full max-h-full object-contain shadow-lg transition-all duration-500 ${showEnhancedPreview ? 'scale-[0.98] ring-2 ring-cyan-500/30 rounded-lg' : ''}`}
                  />
                  {showEnhancedPreview && (
                    <div className="absolute top-6 right-6 bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg shadow-cyan-500/20 z-10">
                        Generated with Nano Banana
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full max-w-xl max-h-[400px]">
                  <DragDropZone onFileSelect={handleFileSelect} />
                </div>
              )}
           </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0F172A]">
           <div className="flex-none h-12 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <FileCode size={14} className="text-cyan-500" /> Generated SQL
              </h2>
              {workflowStage === WorkflowStage.DONE && (
                <div className="relative group">
                    <select 
                    value={dialect}
                    onChange={(e) => handleDatabaseSelection(e.target.value)}
                    className="appearance-none bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded pl-2 pr-7 py-1 focus:outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-slate-900 transition-colors font-medium"
                    >
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="MySQL">MySQL</option>
                    <option value="SQLite">SQLite</option>
                    <option value="SQL Server">SQL Server</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="Prisma">Prisma</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              )}
           </div>

           <div className="flex-1 overflow-hidden relative">
              <CodeEditor 
                code={code} 
                stage={workflowStage}
                dialect={dialect}
              />
           </div>
        </div>

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