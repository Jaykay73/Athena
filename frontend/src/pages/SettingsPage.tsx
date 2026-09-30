import React, { useState, useEffect } from 'react';
import {
  Settings, Cpu, ShieldCheck, Database, Key,
  CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getSettings()
      .then((data) => setSettingsData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">System & Model Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure LLM orchestration, model provider fallback, and analytical execution guardrails.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {/* Active Model Engine */}
          <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">LLM Provider Orchestration</h3>
                <p className="text-[11px] text-slate-400">Abstracted multi-provider architecture with automatic deterministic fallback</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-500">Configured Provider</span>
                <div className="text-sm font-bold font-mono text-slate-200 capitalize">
                  {settingsData?.active_provider || 'Deterministic'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Model: {settingsData?.active_model || 'athena-deterministic-v1'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-500">Fallback Protection</span>
                <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Deterministic Offline Fallback
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Zero downtime if external API limits are exceeded
                </div>
              </div>
            </div>

            {/* Provider Connectivity Status */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300">Provider Status:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-slate-300">OpenAI</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settingsData?.openai_configured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {settingsData?.openai_configured ? 'Active' : 'Unset'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-slate-300">Gemini</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settingsData?.gemini_configured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {settingsData?.gemini_configured ? 'Active' : 'Unset'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-slate-300">DeepSeek</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settingsData?.deepseek_configured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {settingsData?.deepseek_configured ? 'Active' : 'Unset'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-slate-300">OpenRouter</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settingsData?.openrouter_configured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {settingsData?.openrouter_configured ? 'Active' : 'Unset'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Budgets & Guardrails */}
          <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Guardrails & Execution Budgets</h3>
                <p className="text-[11px] text-slate-400">Strict safety controls preventing infinite loops and long-running queries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Max Agent Iterations</span>
                <span className="text-base font-bold text-slate-200">{settingsData?.max_iterations || 8} iterations</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Execution Timeout</span>
                <span className="text-base font-bold text-slate-200">{settingsData?.timeout_seconds || 30} seconds</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">SQL Execution Mode</span>
                <span className="text-base font-bold text-emerald-400">Read-Only Enforced</span>
              </div>
            </div>
          </div>

          {/* Analytical Engine Infrastructure */}
          <div className="bg-[#101725] border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Data Engineering Stack</h3>
                <p className="text-[11px] text-slate-400">Underlying engines powering computations and metadata</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Analytical Engine:</span>
                <span className="text-slate-200">DuckDB v1.5.6 (Columnar Vectorized Engine)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Statistical Framework:</span>
                <span className="text-slate-200">Python NumPy, SciPy & Scikit-learn (Tukey IQR, Isolation Forest)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Application Metadata DB:</span>
                <span className="text-slate-200">SQLAlchemy ORM (SQLite / PostgreSQL)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span>Document RAG Engine:</span>
                <span className="text-slate-200">BM25 / Keyword Density with Strict Injection Isolation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
