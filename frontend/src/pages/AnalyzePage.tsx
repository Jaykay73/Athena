import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, ShieldCheck, Database, GitCommit,
  CheckCircle2, XCircle, HelpCircle, AlertTriangle,
  ArrowRight, FileText, Bookmark, RotateCcw, Code, ChevronRight
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';
import { Analysis, ChartSpec } from '../types';
import { ChartRenderer } from '../components/charts/ChartRenderer';
import { EvidenceDrawer } from '../components/analysis/EvidenceDrawer';
import { LineageViewer } from '../components/analysis/LineageViewer';
import { ChallengeModal } from '../components/analysis/ChallengeModal';

export const AnalyzePage: React.FC = () => {
  const { activeWorkspace, datasets, activeDataset, setActiveDataset } = useWorkspace();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<string>('');
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recentHistory, setRecentHistory] = useState<Analysis[]>([]);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showChallenge, setShowChallenge] = useState<boolean>(false);
  const [challengeLoading, setChallengeLoading] = useState<boolean>(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [activeRightTab, setActiveRightTab] = useState<'trace' | 'lineage'>('trace');
  const [selectedQueryToView, setSelectedQueryToView] = useState<string | null>(null);

  // Load latest or initial analysis on mount
  useEffect(() => {
    if (!activeWorkspace) return;
    api.getAnalyses(activeWorkspace.id).then((analyses) => {
      setRecentHistory(analyses);
      const urlQ = searchParams.get('q');
      if (urlQ) {
        setQuestion(urlQ);
        handleRunAnalysis(urlQ);
      } else if (analyses.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(analyses[0]);
      }
    });
  }, [activeWorkspace?.id]);

  const handleRunAnalysis = async (qToRun?: string) => {
    const targetQ = qToRun || question;
    if (!targetQ.trim() || !activeWorkspace) return;

    setLoading(true);
    try {
      const res = await api.createAnalysis(
        activeWorkspace.id,
        targetQ,
        activeDataset?.name || 'sales_transactions'
      );
      setCurrentAnalysis(res);
      setRecentHistory((prev) => [res, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!currentAnalysis) return;
    setShowChallenge(true);
    setChallengeLoading(true);
    try {
      const res = await api.challengeAnalysis(currentAnalysis.id);
      setChallengeResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!currentAnalysis) return;
    try {
      const res = await api.toggleSaveAnalysis(currentAnalysis.id);
      setCurrentAnalysis((prev) => prev ? { ...prev, is_saved: res.is_saved } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRerun = async () => {
    if (!currentAnalysis) return;
    setLoading(true);
    try {
      const res = await api.rerunAnalysis(currentAnalysis.id);
      setCurrentAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    "Why did revenue decline in Q3 compared to Q2?",
    "Which products are driving our growth?",
    "Which customers are becoming inactive?",
    "Compare our performance across regions.",
    "What are the biggest anomalies in our sales?",
    "Which products have declining margins?",
    "Why did enterprise revenue fall and does our pricing policy explain this?"
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* LEFT COLUMN: Input & Conversation History (w-80) */}
      <div className="w-80 bg-[#0d121d] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Analytical Investigation
          </div>

          {/* Dataset selector */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">Target Dataset:</label>
            <select
              value={activeDataset?.name || ''}
              onChange={(e) => {
                const ds = datasets.find((d) => d.name === e.target.value);
                if (ds) setActiveDataset(ds);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.row_count.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Question input */}
          <div className="space-y-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask an analytical question..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunAnalysis();
                }
              }}
            />
            <button
              onClick={() => handleRunAnalysis()}
              disabled={loading || !question.trim()}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Investigating...' : 'Run Investigation'}</span>
            </button>
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5">
            Suggested Inquiries
          </div>
          <div className="space-y-1 overflow-y-auto max-h-40">
            {promptSuggestions.map((ps, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(ps);
                  handleRunAnalysis(ps);
                }}
                className="w-full text-left text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/60 p-1.5 rounded transition truncate"
              >
                &bull; {ps}
              </button>
            ))}
          </div>
        </div>

        {/* Previous Investigations */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">
            Workspace History
          </div>
          {recentHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setCurrentAnalysis(item)}
              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                currentAnalysis?.id === item.id
                  ? 'bg-blue-600/15 border-blue-500/40 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="font-medium line-clamp-1">{item.question}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                <span>{item.confidence} Conf.</span>
                <span>{item.execution_duration_ms ? `${Math.round(item.execution_duration_ms)}ms` : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: Investigation Findings, Hypotheses & Visuals */}
      <div className="flex-1 bg-[#0b0f17] overflow-y-auto p-8 space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-semibold text-slate-200">Athena is investigating...</div>
            <div className="text-xs text-slate-400 font-mono">
              Forming competing hypotheses &bull; Running DuckDB queries &bull; Verifying numerical proof
            </div>
          </div>
        ) : !currentAnalysis ? (
          <div className="py-24 text-center text-xs text-slate-500">
            No analysis loaded. Select a question on the left to start.
          </div>
        ) : (
          <>
            {/* Top Analysis Header & Action Toolbar */}
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {currentAnalysis.intent || 'Verified Investigation'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Confidence: {currentAnalysis.confidence}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-100">{currentAnalysis.question}</h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleChallenge}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Challenge Athena</span>
                </button>
                <button
                  onClick={() => setShowEvidence(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Show Evidence ({currentAnalysis.evidence.length})</span>
                </button>
                <button
                  onClick={handleToggleSave}
                  className={`p-2 rounded-lg border text-xs transition ${
                    currentAnalysis.is_saved
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title={currentAnalysis.is_saved ? 'Saved' : 'Save Analysis'}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRerun}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-xs transition"
                  title="Reproduce / Rerun"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Headline Finding Banner */}
            <div className="bg-[#101725] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
                Executive Synthesis
              </div>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                {currentAnalysis.findings_summary}
              </p>
            </div>

            {/* Key Computed Metrics Grid */}
            {currentAnalysis.metrics && currentAnalysis.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentAnalysis.metrics.map((m, idx) => (
                  <div key={idx} className="bg-[#101725] border border-slate-800 p-3.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-medium truncate">{m.name}</div>
                    <div className="text-base font-bold font-mono text-slate-100 mt-1">
                      {m.formatted || String(m.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tested Hypotheses Section */}
            {currentAnalysis.hypotheses && currentAnalysis.hypotheses.length > 0 && (
              <div className="bg-[#101725] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-semibold text-slate-200 tracking-tight">
                    Tested Competing Hypotheses ({currentAnalysis.hypotheses.length})
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Falsification & Validation Engine
                  </span>
                </div>

                <div className="space-y-2">
                  {currentAnalysis.hypotheses.map((h) => {
                    const isSupported = h.status === 'supported';
                    const isRefuted = h.status === 'refuted';
                    return (
                      <div
                        key={h.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex items-start gap-3"
                      >
                        <div className="pt-0.5">
                          {isSupported ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isRefuted ? (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-200">{h.statement}</span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                isSupported
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : isRefuted
                                  ? 'bg-rose-500/10 text-rose-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {h.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            Evidence: {h.evidence_summary}
                            {h.numeric_impact && (
                              <span className="ml-2 font-bold text-slate-300">
                                (Impact: {h.numeric_impact})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Render Charts */}
            {currentAnalysis.charts && currentAnalysis.charts.map((chart) => (
              <ChartRenderer key={chart.id} spec={chart} />
            ))}

            {/* Tabular Breakdowns */}
            {currentAnalysis.tables && currentAnalysis.tables.map((tbl, idx) => (
              <div key={idx} className="bg-[#101725] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 font-semibold text-xs text-slate-200">
                  {tbl.title}
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      {tbl.columns.map((col) => (
                        <th key={col} className="py-2 px-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                    {tbl.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-800/30">
                        {tbl.columns.map((col) => (
                          <td key={col} className="py-2.5 px-3">
                            {row[col] !== undefined ? String(row[col]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Strategic Recommendations */}
            {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
              <div className="bg-[#101725] border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="text-xs font-semibold text-slate-200 tracking-tight">
                  Recommended Operational Next Steps
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {currentAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence Rationale & Caveats */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="text-xs font-semibold text-slate-200">
                Confidence Rationale & Governance Limitations
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                <div className="space-y-1">
                  <strong className="text-slate-300 block mb-1">Why Confidence is {currentAnalysis.confidence}:</strong>
                  {currentAnalysis.confidence_rationale?.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">&bull;</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <strong className="text-slate-300 block mb-1">Limitations & Caveats:</strong>
                  {currentAnalysis.limitations?.map((lim, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">&bull;</span>
                      <span>{lim}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT COLUMN: Execution Trace & Lineage Drawer (w-80) */}
      <div className="w-80 bg-[#0d121d] border-l border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveRightTab('trace')}
              className={`text-xs px-2.5 py-1 rounded transition font-medium ${
                activeRightTab === 'trace'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution Trace
            </button>
            <button
              onClick={() => setActiveRightTab('lineage')}
              className={`text-xs px-2.5 py-1 rounded transition font-medium ${
                activeRightTab === 'lineage'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Data Lineage
            </button>
          </div>
          {currentAnalysis && (
            <span className="text-[10px] font-mono text-slate-500">
              {currentAnalysis.execution_duration_ms ? `${Math.round(currentAnalysis.execution_duration_ms)}ms` : ''}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeRightTab === 'trace' ? (
            !currentAnalysis?.steps || currentAnalysis.steps.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">No trace available.</div>
            ) : (
              currentAnalysis.steps.map((st) => (
                <div key={st.step_number} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                      Step {st.step_number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {st.duration_ms ? `${Math.round(st.duration_ms)}ms` : ''}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200">{st.action}</div>
                  {st.details && (
                    <pre className="text-[10px] font-mono bg-slate-950 text-slate-400 p-1.5 rounded overflow-x-auto mt-1 border border-slate-800/80">
                      {JSON.stringify(st.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )
          ) : (
            <LineageViewer lineage={currentAnalysis?.lineage} />
          )}
        </div>
      </div>

      {/* Slide-out Evidence Drawer */}
      <EvidenceDrawer
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        evidence={currentAnalysis?.evidence || []}
      />

      {/* Challenge Athena Modal */}
      <ChallengeModal
        isOpen={showChallenge}
        onClose={() => setShowChallenge(false)}
        result={challengeResult}
        loading={challengeLoading}
      />
    </div>
  );
};
