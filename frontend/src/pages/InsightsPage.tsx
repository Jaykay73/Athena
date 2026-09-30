import React, { useState, useEffect } from 'react';
import {
  Sparkles, AlertTriangle, TrendingDown, Layers,
  ShieldAlert, UserX, ArrowRight, ShieldCheck, CheckCircle
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';
import { AutonomousInvestigation, InsightFinding } from '../types';

export const InsightsPage: React.FC = () => {
  const { activeWorkspace, activeDataset } = useWorkspace();
  const [investigation, setInvestigation] = useState<AutonomousInvestigation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFinding, setSelectedFinding] = useState<InsightFinding | null>(null);

  const handleScan = async () => {
    if (!activeDataset) return;
    setLoading(true);
    try {
      const res = await api.scanDataset(activeDataset.name);
      setInvestigation(res);
      if (res.findings.length > 0) {
        setSelectedFinding(res.findings[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDataset && !investigation) {
      handleScan();
    }
  }, [activeDataset?.name]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend': return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case 'margin': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'churn': return <UserX className="w-4 h-4 text-purple-400" />;
      case 'quality': return <ShieldAlert className="w-4 h-4 text-blue-400" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mb-1">
            Autonomous Discovery Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Autonomous Dataset Insights
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Athena independently scans the dataset for anomalies, margin erosion, customer churn, and data quality threats.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={loading || !activeDataset}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-md shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Scanning Dataset...' : 'Investigate Automatically'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-200">Scanning {activeDataset?.name}...</div>
          <div className="text-xs text-slate-500 font-mono">
            Evaluating gross margins &bull; Detecting IQR anomalies &bull; Checking RFM recency &bull; Testing duplicates
          </div>
        </div>
      ) : !investigation || investigation.findings.length === 0 ? (
        <div className="bg-[#101725] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
          No automated findings yet. Click "Investigate Automatically" to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Findings List (1 col) */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Discovered Findings ({investigation.total_findings})
            </div>

            <div className="space-y-2.5">
              {investigation.findings.map((f) => {
                const isSelected = selectedFinding?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFinding(f)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/40 text-white'
                        : 'bg-[#101725] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(f.category)}
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          {f.category}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          f.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-100">{f.title}</h3>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {f.summary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finding Detail & Evidence (2 cols) */}
          <div className="lg:col-span-2">
            {selectedFinding ? (
              <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(selectedFinding.category)}
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        {selectedFinding.category} Finding
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">{selectedFinding.title}</h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400">
                    {selectedFinding.metric_change}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                  <strong className="text-slate-100 block mb-1">Detailed Diagnostic:</strong>
                  {selectedFinding.summary}
                </div>

                {/* Evidence Panel */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Empirical Evidence Proof</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Source Dataset: <strong className="text-slate-200">{selectedFinding.evidence.source_dataset}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {selectedFinding.evidence.verification_status}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      <strong>Claim:</strong> {selectedFinding.evidence.claim}
                    </div>
                    {selectedFinding.evidence.computed_result && (
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] text-blue-300">
                        {JSON.stringify(selectedFinding.evidence.computed_result, null, 2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Strategic Action Item */}
                <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-lg space-y-1">
                  <div className="text-xs font-semibold text-blue-300">Recommended Remediation Action:</div>
                  <p className="text-xs text-slate-300">{selectedFinding.action_item}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a finding on the left to inspect evidence.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
