import React from 'react';
import { X, Database, BrainCircuit, FileJson, MessageSquareText } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-neutral-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">How LegalEase AI Works</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            LegalEase AI is built on a modern Retrieval-Augmented Generation (RAG) architecture using Google's Gemini 1.5 Flash model. Here's a plain-language breakdown of what happens when you upload a document:
          </p>

          <div className="grid gap-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl h-fit">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">1. Local PII Scrubbing (Privacy First)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Before any data leaves your browser's backend session, we run strict regular expressions to detect and redact Personally Identifiable Information (like generic government IDs, PAN, tax IDs, names, and phone numbers). This ensures your sensitive data is never sent to the LLM.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl h-fit">
                <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">2. Gemini 1.5 Flash Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">The scrubbed text (or scanned image) is sent to Gemini 1.5 Flash. We use heavily engineered prompts that pass in your selected <strong className="text-slate-800 dark:text-neutral-300">Jurisdiction</strong> and <strong className="text-slate-800 dark:text-neutral-300">Persona</strong> (Tenant, Landlord, etc.) to ensure the analysis is context-aware.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl h-fit">
                <FileJson className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">3. Structured JSON Output</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Instead of messy text, Gemini is strictly instructed to return data matching our exact JSON schema. This allows our React frontend to reliably render individual risk badges, timelines, and deviation notes without parsing errors.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl h-fit">
                <MessageSquareText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">4. Grounded RAG Chat & Guardrails</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">When you ask questions in the RAG Chat, the model is strictly limited to the document's context. We've implemented active guardrails to detect and reject requests for personal legal advice on active situations.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl h-fit">
                <BrainCircuit className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">5. Deviation & Jurisdiction Intelligence</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Flag unusual terms against standard regional benchmarks.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-black/50 rounded-b-2xl border-t border-slate-100 dark:border-neutral-800 text-center">
            <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Got it
            </button>
        </div>
      </div>
    </div>
  );
}
