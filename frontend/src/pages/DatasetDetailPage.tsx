import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Database, ShieldCheck, AlertTriangle,
  Info, Sparkles, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { api } from '../api/client';
import { Dataset, DatasetProfile } from '../types';

export const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'columns' | 'warnings' | 'preview' | 'correlations'>('columns');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getDataset(id),
      api.getDatasetProfile(id),
      api.getDatasetPreview(id, 25),
    ])
      .then(([ds, prof, prev]) => {
        setDataset(ds);
        setProfile(prof);
        setPreview(prev);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading dataset profile and schema diagnostics...</span>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="p-8 text-center text-xs text-rose-400">
        Dataset not found.{' '}
        <Link to="/data" className="text-blue-400 underline">Back to Data</Link>
      </div>
    );
  }

  const warnings = profile?.warnings || dataset.quality_warnings || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link to="/data" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Datasets</span>
        </Link>
      </div>

      {/* Dataset Overview Header Card */}
      <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono">{dataset.name}</h1>
            <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {dataset.file_type}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            {dataset.description || 'Enterprise transactional dataset indexed for deterministic analytical querying.'}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-3">
            <span>Rows: <strong className="text-slate-200">{dataset.row_count.toLocaleString()}</strong></span>
            <span>Columns: <strong className="text-slate-200">{dataset.column_count}</strong></span>
            {profile?.date_range && (
              <span>Date Window: <strong className="text-slate-200">{profile.date_range}</strong></span>
            )}
          </div>
        </div>

        {/* Quality Score & Investigate Action */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center min-w-[130px]">
            <div className="text-[10px] uppercase font-mono text-slate-500">Data Quality</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {dataset.data_quality_score}/100
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {warnings.length} diagnostic warnings
            </div>
          </div>

          <Link
            to={`/analyze?dataset=${dataset.name}`}
            className="px-4 py-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Investigate Dataset</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('columns')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'columns'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Schema & Semantic Types ({profile?.columns.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('warnings')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'warnings'
              ? 'border-amber-500 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Quality Warnings</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-400 font-mono">
            {warnings.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw Data Preview
        </button>
        {profile?.correlations && (
          <button
            onClick={() => setActiveTab('correlations')}
            className={`pb-3 transition border-b-2 ${
              activeTab === 'correlations'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Numerical Correlations
          </button>
        )}
      </div>

      {/* Tab 1: Column Schema & Semantic Inference */}
      {activeTab === 'columns' && (
        <div className="bg-[#101725] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Inferred Semantic Type</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Missing %</th>
                <th className="py-3 px-4">Unique Values</th>
                <th className="py-3 px-4">Min &bull; Max &bull; Mean</th>
                <th className="py-3 px-4">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {profile?.columns.map((col) => (
                <tr key={col.column_name} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-medium text-slate-100">
                    {col.column_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {col.semantic_type || 'unclassified'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {col.data_type}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={col.missing_percentage > 2 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {col.missing_percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {col.unique_count.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {col.min_value && col.max_value
                      ? `${col.min_value} → ${col.max_value}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                    {col.sample_values ? col.sample_values.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Quality Warnings with Explanations */}
      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {warnings.length === 0 ? (
            <div className="bg-[#101725] border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-400">
              Zero data quality anomalies detected. Dataset is pristine.
            </div>
          ) : (
            warnings.map((w, idx) => (
              <div
                key={idx}
                className="bg-[#101725] border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">{w.message}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {w.code}
                  </span>
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div>
                    <strong className="text-slate-300">Why this matters:</strong> {w.explanation}
                  </div>
                  <div>
                    <strong className="text-slate-300">Suggested Action:</strong> {w.suggested_action}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Raw Data Preview Table */}
      {activeTab === 'preview' && (
        <div className="bg-[#101725] border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
          {preview?.rows && preview.rows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {preview.columns.map((c: string) => (
                    <th key={c} className="py-3 px-4 font-mono">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                {preview.rows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    {preview.columns.map((col: string) => (
                      <td key={col} className="py-2.5 px-4 whitespace-nowrap">
                        {row[col] !== null ? String(row[col]) : <span className="text-rose-400 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">Preview not available.</div>
          )}
        </div>
      )}

      {/* Tab 4: Correlations */}
      {activeTab === 'correlations' && profile?.correlations && (
        <div className="bg-[#101725] border border-slate-800 rounded-xl p-5 overflow-x-auto">
          <div className="text-xs font-semibold text-slate-200 mb-3">Numerical Pearson Correlation Matrix</div>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2 px-3">Metric</th>
                {Object.keys(profile.correlations).map((k) => (
                  <th key={k} className="py-2 px-3">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {Object.entries(profile.correlations).map(([rowKey, colMap]) => (
                <tr key={rowKey}>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{rowKey}</td>
                  {Object.keys(profile.correlations!).map((colKey) => {
                    const val = colMap[colKey];
                    const isHigh = Math.abs(val) > 0.5;
                    return (
                      <td key={colKey} className={`py-2.5 px-3 ${isHigh ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                        {val !== undefined ? val.toFixed(2) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
