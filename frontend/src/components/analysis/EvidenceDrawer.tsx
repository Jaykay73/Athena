import React from 'react';
import { ShieldCheck, Database, Code, CheckCircle, Info } from 'lucide-react';
import { EvidenceItem } from '../../types';

interface EvidenceDrawerProps {
  evidence: EvidenceItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidence, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0f172a] border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Verified Evidence & Lineage</h3>
            <p className="text-[11px] text-slate-400">All claims bound to deterministic computation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
        >
          Close
        </button>
      </div>

      {/* Evidence Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {evidence.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-10">No evidence items recorded.</div>
        ) : (
          evidence.map((ev, idx) => (
            <div key={ev.id || idx} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {ev.computation_type}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {ev.verification_status}
                </span>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-200">{ev.claim}</div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Source: <strong className="text-slate-300 font-mono">{ev.source_dataset}</strong></span>
                </div>
                {ev.relevant_columns && ev.relevant_columns.length > 0 && (
                  <div>
                    <span className="text-slate-500">Columns:</span>{' '}
                    <span className="font-mono text-slate-300">{ev.relevant_columns.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Query or Code */}
              {ev.query_or_code && (
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Code className="w-3 h-3" /> Computation Logic
                  </div>
                  <pre className="text-[10px] font-mono bg-slate-950 text-blue-300 p-2 rounded overflow-x-auto border border-slate-800">
                    {ev.query_or_code}
                  </pre>
                </div>
              )}

              {/* Computed Result */}
              {ev.computed_result && (
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    Computed Output
                  </div>
                  <div className="text-[11px] font-mono bg-slate-950/80 text-emerald-300 p-2 rounded border border-slate-800">
                    {typeof ev.computed_result === 'object'
                      ? JSON.stringify(ev.computed_result, null, 2)
                      : String(ev.computed_result)}
                  </div>
                </div>
              )}

              {/* Assumptions */}
              {ev.assumptions && ev.assumptions.length > 0 && (
                <div className="text-[10px] text-slate-400 flex items-start gap-1 pt-1 border-t border-slate-800/60">
                  <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span>Assumptions: {ev.assumptions.join('; ')}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
