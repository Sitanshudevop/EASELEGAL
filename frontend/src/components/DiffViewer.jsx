import React from 'react';
import { FileDiff, UploadCloud, AlertCircle } from 'lucide-react';

export default function DiffViewer({ diffData, diffing, onUploadSecondFile }) {
  if (!diffData) {
    return (
      <div className="p-12 h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
        <FileDiff className="w-16 h-16 mb-4 text-indigo-300 dark:text-indigo-600" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-neutral-300 mb-2">Compare Documents</h3>
        <p className="max-w-md mb-6">Upload a newer or older version of this contract to generate a plain-English diff of what changed and what it means for you.</p>
        
        <label className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium cursor-pointer shadow-sm transition-all flex items-center gap-2">
          {diffing ? 'Generating Diff...' : <><UploadCloud className="w-5 h-5" /> Select Second Document</>}
          <input type="file" className="hidden" onChange={onUploadSecondFile} disabled={diffing} />
        </label>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-slate-50 dark:bg-black/50 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-neutral-300 flex items-center gap-2">
          <FileDiff className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> 
          Document Comparison
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-black/30">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {diffData.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-slate-400">No significant changes detected.</div>
          ) : (
            diffData.map((change, idx) => (
              <div key={idx} className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                <div className={`px-4 py-2 text-sm font-bold uppercase tracking-wider text-white ${change.type === 'INSERTION' ? 'bg-green-600' : change.type === 'DELETION' ? 'bg-red-600' : 'bg-blue-600'}`}>
                  {change.type}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:border-r md:border-slate-200 dark:md:border-slate-700 md:pr-4">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Original</h4>
                    <p className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded line-through decoration-red-300 dark:decoration-red-600">{change.old_text || 'None'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">New</h4>
                    <p className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap font-mono bg-green-50 dark:bg-green-900/20 p-2 rounded">{change.new_text || 'None'}</p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-t border-amber-100 dark:border-amber-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">What this means</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">{change.explanation}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
