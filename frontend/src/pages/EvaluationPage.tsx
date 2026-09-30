import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Play, ShieldCheck, AlertTriangle,
  Clock, Database, Search, Filter, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { EvaluationRun, EvaluationCaseResult } from '../types';

export const EvaluationPage: React.FC = () => {
  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningSuite, setRunningSuite] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const data = await api.getLatestEvaluation();
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to load evaluation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleRunEvaluation = async () => {
    setRunningSuite(true);
    try {
      const res = await api.runEvaluationSuite();
      setEvaluation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningSuite(false);
    }
  };

  const categories = evaluation?.category_breakdown
    ? ['all', ...Object.keys(evaluation.category_breakdown)]
    : ['all'];

  const filteredCases = (evaluation?.case_results || []).filter((c) => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch =
      c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.actual_output.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mb-1">
            Empirical Benchmark Suite
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Athena Evaluation & Rigor Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirically measured benchmark across 52 test cases covering aggregations, multi-step reasoning, SQL safety, and prompt-injection defense.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={runningSuite}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-md shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Play className={`w-3.5 h-3.5 ${runningSuite ? 'animate-spin' : ''}`} />
          <span>{runningSuite ? 'Executing Suite (52 cases)...' : 'Run Live Benchmark'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-400">Loading benchmark evaluation metrics...</div>
        </div>
      ) : !evaluation ? (
        <div className="text-xs text-slate-400 text-center py-12">No evaluation data available.</div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#101725] border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] uppercase font-mono text-slate-400">Numerical Accuracy</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {evaluation.numerical_accuracy}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {evaluation.passed_cases}/{evaluation.total_cases} passed
              </div>
            </div>

            <div className="bg-[#101725] border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] uppercase font-mono text-slate-400">Evidence Grounding</div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                {evaluation.evidence_grounding}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">All claims bound</div>
            </div>

            <div className="bg-[#101725] border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] uppercase font-mono text-slate-400">SQL Safety & Success</div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                {evaluation.sql_success_rate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">Read-only AST enforced</div>
            </div>

            <div className="bg-[#101725] border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] uppercase font-mono text-slate-400">Hallucination Rate</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {evaluation.hallucination_rate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">Deterministic verifier</div>
            </div>

            <div className="bg-[#101725] border border-slate-800 p-4 rounded-xl col-span-2 md:col-span-1">
              <div className="text-[10px] uppercase font-mono text-slate-400">Average Latency</div>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                {evaluation.average_duration_ms}ms
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">DuckDB in-memory</div>
            </div>
          </div>

          {/* Category Breakdown Progress Bars */}
          <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Category Performance Breakdown
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(evaluation.category_breakdown || {}).map(([catKey, stats]) => (
                <div key={catKey} className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 capitalize font-medium">
                      {catKey.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {stats.accuracy_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${stats.accuracy_pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>{stats.passed}/{stats.total} cases</span>
                    <span>Avg: {stats.avg_latency_ms}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Cases Table Filter & Search */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Benchmark Cases Explorer ({filteredCases.length} of {evaluation.total_cases})
              </h2>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search test case or question..."
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-60 font-sans"
                  />
                </div>

                {/* Category select */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 capitalize"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cases Table */}
            <div className="bg-[#101725] border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Test Question</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Observed Output</th>
                    <th className="py-3 px-4 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                  {filteredCases.map((tc) => (
                    <tr key={tc.case_id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400 font-bold">{tc.case_id}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {tc.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-slate-200 max-w-xs font-medium">
                        {tc.question}
                      </td>
                      <td className="py-3 px-4">
                        {tc.passed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> PASSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> FAILED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-sm truncate text-[11px]">
                        {tc.actual_output}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {tc.latency_ms}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
