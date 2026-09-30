import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, RotateCcw, ArrowRight, ShieldCheck, Database, Calendar } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';
import { Analysis } from '../types';

export const SavedAnalysesPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const [savedList, setSavedList] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rerunningId, setRerunningId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeWorkspace) return;
    api.getAnalyses(activeWorkspace.id).then((analyses) => {
      // Filter saved or all analyses
      const saved = analyses.filter((a) => a.is_saved);
      setSavedList(saved.length > 0 ? saved : analyses.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [activeWorkspace?.id]);

  const handleRerun = async (id: string) => {
    setRerunningId(id);
    try {
      const res = await api.rerunAnalysis(id);
      navigate(`/analyze?id=${res.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setRerunningId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mb-1">
            Reproducibility & Audit Trail
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Saved Analyses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted investigations with exact dataset hashes, deterministic logic versions, and one-click rerun reproducibility.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading saved analyses...</div>
      ) : savedList.length === 0 ? (
        <div className="bg-[#101725] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
          No saved analyses found in this workspace. Bookmark any analysis from the investigation view to save it here.
        </div>
      ) : (
        <div className="space-y-4">
          {savedList.map((an) => (
            <div
              key={an.id}
              className="bg-[#101725] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Version v{an.dataset_version}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Confidence: {an.confidence}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Engine: {an.model_name}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{an.question}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {an.findings_summary}
                </p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>{an.dataset_id || 'sales_transactions'}</span>
                  </span>
                  <span>&bull;</span>
                  <span>Duration: {Math.round(an.execution_duration_ms || 120)}ms</span>
                  <span>&bull;</span>
                  <span>Evidence claims: {an.evidence?.length || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => handleRerun(an.id)}
                  disabled={rerunningId === an.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${rerunningId === an.id ? 'animate-spin' : ''}`} />
                  <span>{rerunningId === an.id ? 'Rerunning...' : 'Re-run Analysis'}</span>
                </button>
                <Link
                  to={`/analyze?id=${an.id}`}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 shadow-sm"
                >
                  <span>Open Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
