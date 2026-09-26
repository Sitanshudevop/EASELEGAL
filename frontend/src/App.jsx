import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AlertTriangle, Scale, History as HistoryIcon, HelpCircle, Sun, Moon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ArchitectureModal from './components/ArchitectureModal';
import { useTheme } from './components/ThemeProvider';

function App() {
  const [jurisdiction, setJurisdiction] = useState('US - General');
  const [language, setLanguage] = useState('English');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black transition-colors duration-200">
        {/* Persistent Disclaimer Header */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 px-4 py-2 flex flex-col md:flex-row items-center justify-center text-xs md:text-sm font-medium text-center gap-1 md:gap-2">
          <AlertTriangle className="w-4 h-4 hidden md:block flex-shrink-0" />
          <span>NOT LEGAL ADVICE: LegalEase AI provides illustrative analysis, not professional legal counsel. Always consult a qualified attorney.</span>
        </div>

        {/* Main Navigation */}
        <header className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-neutral-800 shadow-sm sticky top-0 z-10 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-3 md:h-16 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              <Scale className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">LegalEase AI</span>
            </Link>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <HelpCircle className="w-4 h-4" /> How it Works
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Language:</span>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-neutral-300 focus:ring-indigo-500 focus:border-indigo-500 py-1.5 px-2 transition-colors"
                >
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Jurisdiction:</span>
                <select 
                  value={jurisdiction} 
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-neutral-300 focus:ring-indigo-500 focus:border-indigo-500 max-w-[120px] md:max-w-none py-1.5 px-2 transition-colors"
                >
                  <option>India (Central / State)</option>
                  <option>US - General</option>
                  <option>UK / Common Law</option>
                </select>
              </div>
              <nav className="flex items-center gap-4">
                <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors">Dashboard</Link>
                <Link to="/history" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors flex items-center gap-1">
                  <HistoryIcon className="w-4 h-4" /> History
                </Link>
              </nav>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="relative flex items-center p-1 rounded-full bg-slate-200 dark:bg-slate-700 w-14 h-8 transition-colors shadow-inner"
              >
                <div className={`absolute left-1 flex items-center justify-center w-6 h-6 rounded-full shadow transition-transform duration-300 bg-white dark:bg-slate-900 ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
                  {isDark ? <Moon className="w-3.5 h-3.5 text-yellow-400" /> : <Sun className="w-3.5 h-3.5 text-orange-500" />}
                </div>
              </button>
            </div>
          </div>
        </header>

        <ArchitectureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard jurisdiction={jurisdiction} language={language} />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
