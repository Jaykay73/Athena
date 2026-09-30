import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle, HelpCircle, X } from 'lucide-react';
import { ChallengeResult } from '../../types';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ChallengeResult | null;
  loading: boolean;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  result,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Challenge Athena: Falsification Analysis</h3>
              <p className="text-[11px] text-slate-400">Adversarial self-critique testing alternative hypotheses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs text-slate-300 font-medium">
                Testing counter-hypotheses & temporal sensitivity...
              </div>
              <div className="text-[11px] text-slate-500">
                Stripping outlier cohorts, shifting 30-day windows, and checking sub-segments
              </div>
            </div>
          ) : result ? (
            <>
              {/* Robustness Banner */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Self-Critique Verdict
                  </span>
                  <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                    {result.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400">Robustness Score</span>
                  <div className="text-xl font-bold font-mono text-slate-100">{result.robustness_score}%</div>
                </div>
              </div>

              {/* Verdict Summary */}
              <div className="bg-blue-950/20 border border-blue-900/40 p-3.5 rounded-lg text-xs text-blue-200 leading-relaxed">
                <strong className="text-blue-300 block mb-1">Synthesized Self-Critique:</strong>
                {result.verdict_summary}
              </div>

              {/* Tests Conducted */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-200 tracking-tight">
                  Adversarial Tests Executed:
                </div>
                {result.tests_conducted.map((t, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">{t.name}</span>
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                          t.outcome === 'ROBUST'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {t.outcome}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Methodology:</strong> {t.methodology}
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800/60 font-mono">
                      {t.findings}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 text-center py-6">No challenge executed yet.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Critique
          </button>
        </div>
      </div>
    </div>
  );
};
