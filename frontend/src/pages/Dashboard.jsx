import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, FileText, Settings, Users, Activity, ExternalLink, MessageCircle, Trash2, ShieldAlert, Globe, FileSearch, UserCheck, Clock } from 'lucide-react';
import axios from 'axios';
import SplitPaneViewer from '../components/SplitPaneViewer';
import TimelineViewer from '../components/TimelineViewer';
import DiffViewer from '../components/DiffViewer';

export default function Dashboard({ jurisdiction, language }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState('viewer'); // viewer, timeline, diff, chat
  const [persona, setPersona] = useState('tenant');
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [quickScanText, setQuickScanText] = useState("");
  const [diffData, setDiffData] = useState(null);
  const [diffing, setDiffing] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('legalHistory') || '[]');
    setRecentHistory(saved.reverse().slice(0, 4));
  }, []);

  useEffect(() => {
    if (location.state?.sessionId && location.state?.sessionId !== sessionId) {
      const sid = location.state.sessionId;
      setSessionId(sid);
      setFile({ name: location.state.filename || 'Historical Document' });
      
      setAnalyzing(true);
      axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analyze`, {
        session_id: sid,
        persona: persona,
        jurisdiction: jurisdiction,
        language: language
      }).then(res => {
        setAnalysisData(res.data);
      }).catch(err => {
        console.error(err);
        alert("Error loading historical analysis");
      }).finally(() => {
        setAnalyzing(false);
      });
    }
  }, [location.state, persona, jurisdiction, language]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    try {
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        signal: controller.signal
      });
      const sid = uploadRes.data.session_id;
      setSessionId(sid);
      
      const analyzeRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analyze`, {
        session_id: sid,
        persona: persona,
        jurisdiction: jurisdiction,
        language: language
      }, { signal: controller.signal });
      setAnalysisData(analyzeRes.data);
      
      const history = JSON.parse(localStorage.getItem('legalHistory') || '[]');
      history.push({ filename: uploadedFile.name, date: new Date().toISOString(), session_id: sid });
      localStorage.setItem('legalHistory', JSON.stringify(history));
      clearTimeout(timeoutId);
    } catch (err) {
      console.error("Upload Failure Details:", err);
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        alert("Analysis timed out. Try a shorter document.");
      } else {
        alert(err.message || "Error analyzing document");
      }
    } finally {
      clearTimeout(timeoutId);
      setAnalyzing(false);
    }
  };

  const handleQuickScan = async () => {
    if (!quickScanText) return;
    setAnalyzing(true);
    try {
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/upload-text`, { text: quickScanText });
      const sid = uploadRes.data.session_id;
      setSessionId(sid);
      setFile({ name: 'Quick Scan Snippet' });
      
      const analyzeRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analyze`, {
        session_id: sid,
        persona: persona,
        jurisdiction: jurisdiction,
        language: language
      });
      setAnalysisData(analyzeRes.data);
    } catch (err) {
      console.error(err);
      alert("Error scanning text");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTemplateClick = (type) => {
    setFile({ name: `${type}_Template.pdf` });
    setSessionId(`mock-${Date.now()}`);
    setAnalysisData({
      doc_type: type,
      summary: `This is a standard ${type}. We have analyzed it and identified several standard clauses and potential risk areas for your review.`,
      raw_text: `[DEMO TEXT: ${type}]\n\nSection 1. Confidentiality\nBoth parties agree to keep all shared information strictly confidential for a period of 5 years.\n\nSection 2. Governing Law\nThis agreement shall be governed by the laws of the State of California.\n\nSection 3. Termination\nEither party may terminate this agreement with 30 days written notice.`,
      clauses: [
        { type: 'Confidentiality', risk_level: 'LOW', text: 'Both parties agree to keep all shared information strictly confidential for a period of 5 years.', explanation: 'Standard confidentiality clause for 5 years.', negotiation_tip: '5 years is standard, but you can try to limit it to 3 years.', deviation_note: 'No significant deviation.' },
        { type: 'Termination', risk_level: 'MEDIUM', text: 'Either party may terminate this agreement with 30 days written notice.', explanation: 'You must give 30 days notice to end the agreement.', negotiation_tip: 'If you need more flexibility, negotiate for 15 days.', deviation_note: 'Standard is typically 30-60 days.' }
      ],
      jargon_glossary: [
        { term: 'Confidentiality', definition: 'A legal obligation to keep certain information secret.' },
        { term: 'Termination', definition: 'The ending of a contract before it is fully performed.' }
      ]
    });
  };

  const handleChat = async () => {
    if (!chatQuestion || !sessionId) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chat`, {
        session_id: sessionId,
        question: chatQuestion,
        jurisdiction: jurisdiction,
        language: language
      });
      setChatResponse(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiffUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile || !sessionId) return;
    setDiffing(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    try {
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/upload`, formData);
      const sid2 = uploadRes.data.session_id;
      
      const diffRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/diff`, {
        session_id_1: sessionId,
        session_id_2: sid2
      });
      setDiffData(diffRes.data.changes);
    } catch (err) {
      console.error(err);
      alert("Error generating diff");
    } finally {
      setDiffing(false);
    }
  };

  const handleDownloadDossier = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/generate-dossier`, { session_id: sessionId });
        const blob = new Blob([res.data.dossier_markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dossier.md';
        a.click();
      } catch (e) {
          console.error(e);
      }
  };

  const handleDeleteSession = async () => {
    if (!sessionId) return;
    try {
      if (!sessionId.startsWith('mock-')) {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/session/${sessionId}`);
      }
      const history = JSON.parse(localStorage.getItem('legalHistory') || '[]');
      const newHistory = history.filter(h => h.session_id !== sessionId);
      localStorage.setItem('legalHistory', JSON.stringify(newHistory));
      
      setSessionId(null);
      setAnalysisData(null);
      setFile(null);
      setDiffData(null);
      setChatResponse(null);
    } catch (e) {
      console.error(e);
      alert("Error deleting session.");
    }
  };

  const tabClasses = (tab) => `px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-neutral-100' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'}`;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Quick Scan URL Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          <ExternalLink className="text-slate-400 dark:text-neutral-500 w-5 h-5 flex-shrink-0" />
          <input 
            type="text" 
            value={quickScanText}
            onChange={(e) => setQuickScanText(e.target.value)}
            placeholder="Quick Scan: Paste a contract URL or text snippet here..." 
            className="flex-1 bg-slate-50 dark:bg-slate-700 border-none focus:ring-0 text-sm p-2 rounded-lg text-slate-800 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-500 transition-colors"
            aria-label="Quick Scan text input"
          />
        </div>
        <button onClick={handleQuickScan} disabled={analyzing} aria-label="Scan Now" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap">
          Scan Now
        </button>
      </div>

      {!analysisData ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Left Sidebar: Features Overview */}
          <div className="hidden lg:flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-neutral-100 mb-2 px-1 text-sm tracking-wider uppercase">Features</h3>
            
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 hover:border-orange-500 dark:hover:border-orange-500 transition-colors cursor-default">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2.5 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">PII Scrubbing</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">Local regex redaction</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-default">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">Multi-lingual</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">Supports Hindi & English</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-default">
              <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg">
                <FileSearch className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">Obligations</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">Extracts timeline events</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-default">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg">
                <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100">Persona Analysis</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">Tailored context scoring</p>
              </div>
            </div>
          </div>

          {/* Center Column: Upload & Templates */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-2xl bg-white dark:bg-[#0a0a0a]/50 p-10 lg:p-16 transition-colors shadow-sm">
              <Upload className="w-16 h-16 text-indigo-400 dark:text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-neutral-100 mb-2">Upload Document</h2>
              <p className="text-slate-500 dark:text-neutral-400 mb-6 text-center max-w-sm">Upload a PDF, DOCX, or Image (scanned). We'll automatically scrub PII and extract key legal obligations.</p>
              
              <label tabIndex={0} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium cursor-pointer shadow-sm shadow-indigo-200 dark:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                {analyzing ? 'Analyzing...' : 'Select File'}
                <input type="file" className="hidden" onChange={handleFileUpload} onClick={(e) => { e.target.value = null; }} disabled={analyzing} aria-label="File upload" />
              </label>

              <div className="mt-8 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-500 text-xs px-4 py-3 rounded-lg text-center max-w-sm">
                <strong>Data Privacy Guaranteed:</strong> Your documents are securely processed locally, not used for model training, and deleted immediately after your session.
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-neutral-100 mb-4 px-1 text-sm tracking-wider uppercase">Quick Templates</h3>
              <div className="grid grid-cols-2 gap-4">
                {[{name: 'Rental Agreement', desc: 'Standard residential lease'}, {name: 'Employment Contract', desc: 'Full-time employment terms'}, {name: 'NDA', desc: 'Non-disclosure agreement'}, {name: 'Terms of Service', desc: 'Standard platform terms'}].map(template => (
                  <button 
                    key={template.name}
                    onClick={() => handleTemplateClick(template.name)}
                    className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 p-4 rounded-xl text-left shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-slate-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{template.name}</span>
                      <FileText className="w-4 h-4 text-slate-300 dark:text-neutral-700 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">{template.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Recent Activity */}
          <div className="hidden lg:flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 dark:text-neutral-100 mb-2 px-1 text-sm tracking-wider uppercase">Recent Activity</h3>
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl p-1 shadow-sm">
              {recentHistory.length === 0 ? (
                <div className="p-6 text-left">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-neutral-100 mb-2">Quick-Start Guide</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <li className="flex gap-2 items-start"><span className="text-indigo-500 font-bold">1.</span> Upload a document or select a template</li>
                    <li className="flex gap-2 items-start"><span className="text-indigo-500 font-bold">2.</span> Select your Persona (e.g., Tenant)</li>
                    <li className="flex gap-2 items-start"><span className="text-indigo-500 font-bold">3.</span> Toggle Dual-Persona to compare perspectives</li>
                    <li className="flex gap-2 items-start"><span className="text-indigo-500 font-bold">4.</span> View extracted date-bound obligations</li>
                  </ul>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {recentHistory.map((item, idx) => (
                    <div key={idx} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-neutral-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-neutral-200 truncate pr-2 max-w-[200px]" title={item.filename}>{item.filename}</p>
                        <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-[#0a0a0a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 gap-4 md:gap-0 transition-colors">
            <div className="flex items-center gap-4">
              <FileText className="text-indigo-600 dark:text-indigo-400 w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-neutral-100 line-clamp-1">{file?.name}</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400">{analysisData.doc_type}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg w-full md:w-auto overflow-x-auto overflow-y-hidden whitespace-nowrap">
                <button aria-label="View split pane" onClick={() => setActiveTab('viewer')} className={tabClasses('viewer')}>Viewer</button>
                <button aria-label="View timeline" onClick={() => setActiveTab('timeline')} className={tabClasses('timeline')}>Timeline</button>
                <button aria-label="View chat" onClick={() => setActiveTab('chat')} className={tabClasses('chat')}>RAG Chat</button>
                <button aria-label="View comparison" onClick={() => setActiveTab('diff')} className={tabClasses('diff')}>Compare</button>
              </div>
              <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-600"></div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
                <select value={persona} onChange={(e) => setPersona(e.target.value)} aria-label="Select Persona" className="text-sm border border-slate-300 dark:border-neutral-700 rounded-lg py-1.5 px-2 bg-white dark:bg-slate-700 dark:text-neutral-300 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="tenant">Tenant Persona</option>
                  <option value="landlord">Landlord Persona</option>
                  <option value="employee">Employee Persona</option>
                </select>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                  <button onClick={handleDeleteSession} aria-label="Delete Session Data" className="flex-1 md:flex-none bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex justify-center items-center gap-2">
                    <Trash2 className="w-4 h-4" /> End Session
                  </button>
                  <button onClick={handleDownloadDossier} aria-label="Prepare Dossier" className="flex-1 md:flex-none bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-800 dark:hover:bg-indigo-700 text-center transition-colors">
                    Prep Dossier
                  </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden transition-colors">
            {activeTab === 'viewer' && <SplitPaneViewer analysis={analysisData} sessionId={sessionId} jurisdiction={jurisdiction} language={language} currentPersona={persona} />}
            {activeTab === 'timeline' && <TimelineViewer sessionId={sessionId} />}
            {activeTab === 'diff' && <DiffViewer diffData={diffData} diffing={diffing} onUploadSecondFile={handleDiffUpload} />}
            {activeTab === 'chat' && (
                <div className="p-6 md:p-8 max-w-2xl mx-auto flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-neutral-100">Grounded Q&A</h3>
                    <div className="flex-1 overflow-y-auto mb-4 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 bg-slate-50 dark:bg-black/50">
                        {chatResponse && (
                            <div>
                                <p className="font-medium text-slate-800 dark:text-neutral-300">{chatResponse.answer}</p>
                                <div className="mt-2 text-sm text-slate-500 flex gap-2 items-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${chatResponse.confidence_score === 'HIGH' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'}`}>
                                        Confidence: {chatResponse.confidence_score}
                                    </span>
                                </div>
                                {chatResponse.citations && chatResponse.citations.map((c,i) => <p key={i} className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">"{c}"</p>)}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input value={chatQuestion} onChange={e => setChatQuestion(e.target.value)} placeholder="Ask a question about the document..." className="flex-1 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 bg-white dark:bg-[#0a0a0a] dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Chat input" />
                        <button onClick={handleChat} aria-label="Ask Question" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 rounded-lg font-medium transition-colors">Ask</button>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
