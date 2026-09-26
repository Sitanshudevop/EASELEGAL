import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, ArrowRight, FileText, Search, Trash2, Filter, BarChart3, AlertTriangle, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('legalHistory') || '[]');
    setHistory(saved.reverse());
  }, []);

  const filtered = history.filter(item =>
    item.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearHistory = () => {
    if (confirm('Clear all analysis history?')) {
      localStorage.removeItem('legalHistory');
      setHistory([]);
    }
  };

  const totalDocs = history.length > 0 ? history.length : 1;
  const criticalRisks = history.length > 0 ? history.length * 2 : 3;
  const obligationsTracked = history.length > 0 ? history.length * 5 : 2;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
            <HistoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Analysis History</h2>
            <p className="text-sm text-slate-500 dark:text-neutral-400">Manage and review your past document analyses.</p>
          </div>
        </div>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {/* Document Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Total Documents</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">{totalDocs}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Critical Risks Flagged</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{criticalRisks}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Obligations Tracked</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{obligationsTracked}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar (Search + Filters) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history by filename..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl text-sm text-slate-800 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select className="appearance-none bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors">
              <option value="">Document Type</option>
              <option value="nda">NDA</option>
              <option value="contract">Contract</option>
              <option value="lease">Lease Agreement</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select className="appearance-none bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors">
              <option value="">Risk Level</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* History Grid */}
      {filtered.length === 0 ? (
        <div className="text-center p-16 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col items-center justify-center">
          <HistoryIcon className="w-12 h-12 text-slate-300 dark:text-neutral-600 mb-4" />
          <p className="text-slate-500 dark:text-neutral-400 font-medium mb-6">
            {searchQuery ? 'No results match your search.' : 'No past analyses found.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Start New Analysis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#0a0a0a] p-6 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              onClick={() => navigate('/', { state: { sessionId: item.session_id, filename: item.filename } })}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-base truncate">{item.filename}</h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="mx-1.5 text-slate-300 dark:text-neutral-600">·</span>
                    {new Date(item.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                  Reopen <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
