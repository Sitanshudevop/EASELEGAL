import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, BookOpen, Volume2 } from 'lucide-react';
import axios from 'axios';

export default function SplitPaneViewer({ analysis, sessionId, jurisdiction, language, currentPersona }) {
  const [selectedClause, setSelectedClause] = useState(null);
  const [leftTab, setLeftTab] = useState('extracted'); // 'extracted' or 'original'
  const [viewMode, setViewMode] = useState('single');
  const [secondaryAnalysis, setSecondaryAnalysis] = useState(null);
  const [isFetchingDual, setIsFetchingDual] = useState(false);

  useEffect(() => {
    if (viewMode === 'dual' && !secondaryAnalysis && sessionId) {
      if (!sessionId.startsWith('mock-')) {
        const opposing = currentPersona === 'tenant' ? 'landlord' : (currentPersona === 'employee' ? 'employer' : 'counterparty');
        setIsFetchingDual(true);
        axios.post('http://localhost:8000/api/analyze', {
          session_id: sessionId,
          persona: opposing,
          jurisdiction: jurisdiction,
          language: language
        }).then(res => setSecondaryAnalysis(res.data))
          .catch(err => console.error(err))
          .finally(() => setIsFetchingDual(false));
      } else {
        const mockSecondary = JSON.parse(JSON.stringify(analysis));
        mockSecondary.clauses = mockSecondary.clauses.map(c => ({
          ...c,
          risk_level: c.risk_level === 'HIGH' ? 'LOW' : (c.risk_level === 'LOW' ? 'HIGH' : 'MEDIUM'),
          explanation: `[Opposing Perspective] ${c.explanation}`,
          negotiation_tip: `[Opposing Perspective] Ensure the opposite of what the other party wants.`,
          deviation_note: c.deviation_note ? `[Opposing Perspective] ${c.deviation_note}` : null
        }));
        setSecondaryAnalysis(mockSecondary);
      }
    }
  }, [viewMode, sessionId, currentPersona, jurisdiction, language, secondaryAnalysis, analysis]);

  if (!analysis) return null;

  const renderRiskIcon = (level) => {
    switch(level) {
      case 'HIGH': return <div className="flex items-center gap-1 text-red-500 dark:text-red-400 font-bold uppercase"><AlertCircle className="w-5 h-5" /> 🔴 [HIGH RISK]</div>;
      case 'MEDIUM': return <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 font-bold uppercase"><AlertCircle className="w-5 h-5" /> 🟡 [MED RISK]</div>;
      case 'LOW': return <div className="flex items-center gap-1 text-green-500 dark:text-green-400 font-bold uppercase"><CheckCircle2 className="w-5 h-5" /> 🟢 [LOW RISK]</div>;
      default: return <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 font-bold uppercase"><Info className="w-5 h-5" /> 🔵 [INFO]</div>;
    }
  };

  const getRiskLabel = (level) => {
      if(level === 'HIGH') return '🔴 [HIGH RISK]';
      if(level === 'MEDIUM') return '🟡 [MED RISK]';
      if(level === 'LOW') return '🟢 [LOW RISK]';
      return '🔵 [INFO]';
  };

  const renderRiskClass = (level) => {
    switch(level) {
      case 'HIGH': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700';
      case 'MEDIUM': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700';
      case 'LOW': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700';
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const renderDocumentText = () => {
    if (!analysis.raw_text) return <p className="text-slate-500 dark:text-slate-400 italic p-4">Original text not available for this session. Try re-uploading.</p>;
    
    let parts = [{ text: analysis.raw_text, clause: null }];
    
    (analysis.clauses || []).forEach(clause => {
      if (!clause.text || clause.text.length < 5) return;
      
      const newParts = [];
      parts.forEach(part => {
        if (part.clause) {
          newParts.push(part);
          return;
        }
        
        const index = part.text.indexOf(clause.text);
        if (index === -1) {
          newParts.push(part);
        } else {
          newParts.push({ text: part.text.substring(0, index), clause: null });
          newParts.push({ text: clause.text, clause: clause });
          newParts.push({ text: part.text.substring(index + clause.text.length), clause: null });
        }
      });
      parts = newParts;
    });

    return (
      <div className="whitespace-pre-wrap font-serif text-slate-800 dark:text-slate-300 leading-relaxed text-sm bg-white dark:bg-[#0a0a0a] p-6 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm mt-4">
        {parts.map((part, i) => {
          if (part.clause) {
            const isSelected = selectedClause === part.clause;
            let bgColor = 'bg-blue-200 dark:bg-blue-800/50';
            if (part.clause.risk_level === 'HIGH') bgColor = 'bg-red-200 dark:bg-red-800/50';
            else if (part.clause.risk_level === 'MEDIUM') bgColor = 'bg-yellow-200 dark:bg-yellow-800/50';
            else if (part.clause.risk_level === 'LOW') bgColor = 'bg-green-200 dark:bg-green-800/50';
            
            return (
              <mark 
                key={i} 
                onClick={() => setSelectedClause(part.clause)}
                className={`cursor-pointer px-1 rounded transition-colors ${bgColor} ${isSelected ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:opacity-80'}`}
                title={`Click to view analysis for this ${part.clause.risk_level} risk clause`}
              >
                {part.text}
              </mark>
            );
          }
          return <span key={i}>{part.text}</span>;
        })}
      </div>
    );
  };

  const ClauseDetails = ({ clause }) => (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-black/50 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 relative group">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Plain Language Explanation</h4>
        <p className="text-slate-900 dark:text-neutral-300 pr-16">{clause.explanation}</p>
        <button 
          onClick={() => speakText(clause.explanation)} 
          aria-label="Listen to explanation"
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-xs font-medium"
        >
          <Volume2 className="w-4 h-4" /> Listen
        </button>
      </div>
      
      {clause.deviation_note && (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 relative group">
          <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">Deviation from Standard</h4>
          <p className="text-orange-900 dark:text-orange-300 pr-16">{clause.deviation_note}</p>
          <button 
            onClick={() => speakText(clause.deviation_note)} 
            aria-label="Listen to deviation note"
            className="absolute top-4 right-4 text-orange-400 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-300 flex items-center gap-1 text-xs font-medium"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </div>
      )}
      
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 relative group">
        <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Negotiation Tip</h4>
        <p className="text-indigo-900 dark:text-indigo-300 pr-16">{clause.negotiation_tip}</p>
        <button 
          onClick={() => speakText(clause.negotiation_tip)} 
          aria-label="Listen to negotiation tip"
          className="absolute top-4 right-4 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1 text-xs font-medium"
        >
          <Volume2 className="w-4 h-4" /> Listen
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
      {/* Left Pane - Document text/clauses */}
      <div className={`w-full ${viewMode === 'dual' ? 'md:w-1/3' : 'md:w-1/2'} p-4 md:p-6 overflow-y-auto bg-slate-50 dark:bg-black/50 h-full flex-1 min-h-0 transition-all`}>
        <div className="pr-4">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-neutral-800 pb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Document View</h3>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                <button 
                  onClick={() => setLeftTab('extracted')} 
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${leftTab === 'extracted' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Extracted
                </button>
                <button 
                  onClick={() => setLeftTab('original')} 
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${leftTab === 'original' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Original
                </button>
            </div>
        </div>
        <div className="mb-6 text-slate-700 dark:text-slate-300 italic border-l-4 border-indigo-300 dark:border-indigo-500 pl-4 bg-white dark:bg-[#0a0a0a] p-4 rounded-r-lg shadow-sm flex flex-row justify-between items-start gap-4 max-h-48 overflow-y-auto flex-shrink-0">
          <div className="flex-1">
            <strong>Summary:</strong> {analysis.summary}
          </div>
          <button 
            onClick={() => speakText(analysis.summary)} 
            aria-label="Listen to summary"
            className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 text-xs font-medium flex-shrink-0"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </div>
        
        <div className="space-y-4 mt-4">
          {leftTab === 'original' ? (
              renderDocumentText()
          ) : (
              analysis.clauses?.map((clause, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedClause(clause)}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter') setSelectedClause(clause); }}
                  aria-label={`${clause.risk_level} risk clause of type ${clause.type}`}
                  className={`p-5 border rounded-xl cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${renderRiskClass(clause.risk_level)} ${selectedClause === clause ? 'ring-2 ring-indigo-500 shadow-md' : 'shadow-sm'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{renderRiskIcon(clause.risk_level)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{clause.type}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">(Information only)</span>
                      </div>
                      <p className="text-slate-900 dark:text-neutral-300 leading-relaxed text-sm">"{clause.text}"</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
        </div>
      </div>
      
      {/* Right Pane - Context details */}
      <div className={`w-full ${viewMode === 'dual' ? 'md:w-2/3' : 'md:w-1/2'} p-4 md:p-6 overflow-y-auto h-full flex-1 min-h-0 bg-white dark:bg-[#0a0a0a] transition-all relative`}>
        <div className="pr-4">
        <div className="flex justify-end pb-4 mb-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg z-10">
            <button 
              onClick={() => setViewMode('single')} 
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'single' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Single Persona
            </button>
            <button 
              onClick={() => setViewMode('dual')} 
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'dual' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Dual-Persona Comparison
            </button>
          </div>
        </div>

        {!selectedClause ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 mt-10">
            <BookOpen className="w-12 h-12 mb-4 text-slate-200 dark:text-slate-600" />
            <p>Select a highlighted clause on the left to view detailed analysis</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-4">
            {viewMode === 'single' ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-neutral-800">
                  {renderRiskIcon(selectedClause.risk_level)}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analysis Details</h3>
                </div>
                <ClauseDetails clause={selectedClause} />
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-neutral-800 pb-2 mb-4">Jargon Glossary</h4>
                  <div className="grid gap-3">
                    {analysis.jargon_glossary?.map((term, i) => (
                      <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                        <div className="font-medium text-indigo-700 dark:text-indigo-400 min-w-[120px]">{term.term}</div>
                        <div className="text-slate-600 dark:text-slate-400 text-sm">{term.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-4 uppercase text-sm tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900 pb-2">
                    {currentPersona || 'Primary'} Perspective
                  </h3>
                  <div className="mb-4">{renderRiskIcon(selectedClause.risk_level)}</div>
                  <ClauseDetails clause={selectedClause} />
                </div>
                <div>
                  <h3 className="font-bold mb-4 uppercase text-sm tracking-wider text-orange-600 dark:text-orange-400 border-b border-orange-100 dark:border-orange-900 pb-2">
                    Opposing Perspective
                  </h3>
                  {isFetchingDual ? (
                    <div className="text-slate-500 animate-pulse mt-10 text-center">Fetching contrasting analysis...</div>
                  ) : secondaryAnalysis ? (
                    (() => {
                      const secClause = secondaryAnalysis.clauses?.find(c => c.text === selectedClause.text) || secondaryAnalysis.clauses?.[0];
                      if (!secClause) return <div className="text-slate-500">No matching clause analysis found.</div>;
                      return (
                        <>
                          <div className="mb-4">{renderRiskIcon(secClause.risk_level)}</div>
                          <ClauseDetails clause={secClause} />
                        </>
                      );
                    })()
                  ) : (
                    <div className="text-slate-500 mt-10 text-center">Unable to load secondary persona.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
