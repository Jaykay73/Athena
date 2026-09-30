import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Database, GitCommit,
  CheckCircle2, Sparkles, Terminal, FileText, ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg">
            A
          </div>
          <div>
            <span className="font-bold text-slate-100 tracking-tight text-sm">ATHENA</span>
            <span className="text-[11px] text-slate-400 block -mt-1 font-mono">AI Data Analyst</span>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-xs text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#signature" className="hover:text-white transition">Signature Engine</a>
          <a href="#evaluation" className="hover:text-white transition">Evaluation</a>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production AI Data Analyst for Enterprise Business Data</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight mb-6">
          Investigate your business data with an AI that{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            shows its work.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Athena never hallucinates numerical answers. It inspects schemas, forms competing hypotheses,
          executes safe DuckDB queries and Python statistical routines, binds every claim to empirical proof,
          and challenges its own conclusions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition w-full sm:w-auto justify-center"
          >
            <span>Open Athena Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/analyze"
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 transition w-full sm:w-auto"
          >
            Run Demo Investigation
          </Link>
        </div>
      </section>

      {/* Signature Differentiators Grid */}
      <section id="signature" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">Architectural Foundation</h2>
          <h3 className="text-2xl font-bold text-slate-100">Why Athena is Not a Generic CSV Chatbot</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#101725] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <h4 className="text-base font-semibold text-slate-200">Computation Over Generation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              LLMs never perform arithmetic directly. The LLM acts as an analysis planner while deterministic DuckDB and Python statistical engines compute the actual numbers.
            </p>
          </div>

          <div className="bg-[#101725] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              2
            </div>
            <h4 className="text-base font-semibold text-slate-200">Evidence Over Assertion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every factual sentence links back to an evidence record containing the source dataset, columns used, SQL query, computed numerical result, and explicit assumptions.
            </p>
          </div>

          <div className="bg-[#101725] border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              3
            </div>
            <h4 className="text-base font-semibold text-slate-200">Challenge Athena (Self-Critique)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our signature feature: Athena actively attempts to falsify its own findings by testing alternative temporal windows, outlier sensitivity, and sub-segment divergence.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Walkthrough Teaser */}
      <section id="how-it-works" className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-400">Example Analytical Question</span>
              <h3 className="text-lg font-bold text-slate-100">"Why did revenue fall in Q3?"</h3>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20">
              Confidence: HIGH
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">Tested Hypotheses:</h4>
              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Volume Effect:</strong>
                    <div className="text-slate-400 text-[11px]">Order volume fell 16.9%, driving 98.4% of total revenue drop.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Regional Concentration:</strong>
                    <div className="text-slate-400 text-[11px]">North America accounted for 62.0% of the company-wide decline.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Execution Trace</div>
                <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div>1. Inspected schema: 24 columns, 10,070 rows</div>
                  <div>2. Computed QoQ Revenue: -11.8% ($8.21M → $7.24M)</div>
                  <div>3. Decomposed drivers: Volume ($954k) vs Price ($16k)</div>
                  <div>4. Bound RAG policy: Tier 3 discount approval latency</div>
                  <div>5. Verified no-hallucination ground truth</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Execution time: 142ms</span>
                <Link to="/analyze" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                  Inspect in Analysis Workspace <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-8 text-center text-xs text-slate-500">
        <div>ATHENA &bull; Production AI Data Analysis Platform &bull; Built with DuckDB, FastAPI, React & TypeScript</div>
      </footer>
    </div>
  );
};
