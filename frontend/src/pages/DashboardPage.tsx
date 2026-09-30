import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Database, FileText, ArrowRight, ShieldCheck,
  TrendingDown, AlertTriangle, Layers, Clock, CheckCircle
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';
import { Analysis } from '../types';

export const DashboardPage: React.FC = () => {
  const { activeWorkspace, datasets } = useWorkspace();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeWorkspace) {
      api.getAnalyses(activeWorkspace.id)
        .then((data) => setRecentAnalyses(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeWorkspace?.id]);

  const suggestedInvestigations = [
    { title: 'Why did revenue fall in Q3?', desc: 'Multi-step root cause analysis across regions, tiers, and driver decomposition.', category: 'Revenue' },
    { title: 'Which products have declining margins?', desc: 'Evaluates COGS inflation and gross profitability compression by SKU.', category: 'Profitability' },
    { title: 'Which customers are becoming inactive?', desc: 'RFM analysis identifying accounts with 90-day dormant transaction signals.', category: 'Retention' },
    { title: 'Find anomalies management should investigate.', desc: 'Tukey IQR and Z-score outlier detection for sales volume and revenue spikes.', category: 'Risk' },
    { title: 'Compare our performance across regions.', desc: 'Quarter-over-quarter geographic variance and contribution modeling.', category: 'Geography' },
    { title: 'Build me an executive management report for Q3.', desc: 'Comprehensive board-level summary with KPIs, risks, and recommendations.', category: 'Reporting' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mb-1">
            Athena &bull; AI Data Analyst
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Good morning. Your data is ready for investigation.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Workspace: <strong className="text-slate-200">{activeWorkspace?.name || 'Default Workspace'}</strong> &bull; Deterministic analytical computation active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/data"
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 hover:bg-slate-800 transition"
          >
            Upload Data
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Investigation</span>
          </Link>
        </div>
      </div>

      {/* Suggested Investigations Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Suggested Investigations
          </h2>
          <span className="text-[11px] text-slate-500">Click any card to launch investigation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedInvestigations.map((inv, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (inv.category === 'Reporting') {
                  navigate('/reports');
                } else {
                  navigate(`/analyze?q=${encodeURIComponent(inv.title)}`);
                }
              }}
              className="bg-[#101725] border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition hover:shadow-lg hover:shadow-blue-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {inv.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                  {inv.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {inv.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Datasets & Recent Analyses 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Key Datasets (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Datasets ({datasets.length})
            </h2>
            <Link to="/data" className="text-[11px] text-blue-400 hover:text-blue-300">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {datasets.map((ds) => (
              <Link
                key={ds.id}
                to={`/data/${ds.id}`}
                className="block bg-[#101725] border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-200 font-mono">{ds.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      ds.data_quality_score >= 90
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {ds.data_quality_score}/100
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{ds.row_count.toLocaleString()} records &bull; {ds.column_count} cols</span>
                  <span className="uppercase text-[9px] font-mono text-slate-500">{ds.file_type}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Analyses (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent Analyses
            </h2>
            <Link to="/saved" className="text-[11px] text-blue-400 hover:text-blue-300">
              Saved Analyses
            </Link>
          </div>

          <div className="space-y-3">
            {recentAnalyses.length === 0 ? (
              <div className="bg-[#101725] border border-slate-800 rounded-lg p-8 text-center text-xs text-slate-400">
                No analyses completed yet. Click a suggested investigation above to start!
              </div>
            ) : (
              recentAnalyses.map((an) => (
                <Link
                  key={an.id}
                  to={`/analysis/${an.id}`}
                  className="block bg-[#101725] border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {an.intent || 'Investigation'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Confidence: {an.confidence}
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-slate-100">{an.question}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {an.findings_summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {an.execution_duration_ms ? `${Math.round(an.execution_duration_ms)}ms` : ''}
                      </span>
                      <span className="text-[10px] text-blue-400 font-medium hover:underline flex items-center gap-0.5 mt-2">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
