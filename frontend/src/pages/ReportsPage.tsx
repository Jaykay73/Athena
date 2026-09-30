import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Plus, Calendar, ShieldCheck,
  CheckCircle2, ArrowRight, ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';
import { Report } from '../types';

export const ReportsPage: React.FC = () => {
  const { activeWorkspace, activeDataset } = useWorkspace();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    api.getReports(activeWorkspace.id).then((reps) => {
      setReports(reps);
      if (reps.length > 0 && !selectedReport) {
        setSelectedReport(reps[0]);
      }
    });
  }, [activeWorkspace?.id]);

  const handleGenerateReport = async () => {
    if (!activeWorkspace) return;
    setGenerating(true);
    try {
      const rep = await api.createReport(
        activeWorkspace.id,
        "Q3 Executive Business Performance & Risk Report",
        "Comprehensive investigation of revenue contraction, regional drivers, and operational risks",
        activeDataset?.name
      );
      setReports((prev) => [rep, ...prev]);
      setSelectedReport(rep);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mb-1">
            Executive Intelligence
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Executive Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated board-ready reports combining verified KPIs, driver decompositions, risks, and governance caveats.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-md shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{generating ? 'Compiling Report...' : 'Generate Q3 Report'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Reports Sidebar (1 col) */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reports Archive ({reports.length})
          </div>
          <div className="space-y-2">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedReport?.id === rep.id
                    ? 'bg-blue-600/15 border-blue-500/40 text-white'
                    : 'bg-[#101725] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs text-slate-100">{rep.title}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{rep.date_range}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Content View (3 cols) */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <div className="bg-[#101725] border border-slate-800 rounded-2xl p-8 space-y-8 shadow-sm">
              {/* Report Header & Download Actions */}
              <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{selectedReport.title}</h2>
                  {selectedReport.subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{selectedReport.subtitle}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mt-2">
                    <span>Period: <strong className="text-slate-300">{selectedReport.date_range}</strong></span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified by Athena Engine
                    </span>
                  </div>
                </div>

                {/* Export Dropdown / Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={api.getReportExportUrl(selectedReport.id, 'pdf')}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                  <a
                    href={api.getReportExportUrl(selectedReport.id, 'markdown')}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    Markdown
                  </a>
                  <a
                    href={api.getReportExportUrl(selectedReport.id, 'html')}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    HTML
                  </a>
                </div>
              </div>

              {/* Key Metrics Summary Cards */}
              {selectedReport.key_metrics && selectedReport.key_metrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedReport.key_metrics.map((km, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <div className="text-[11px] text-slate-400 font-medium">{km.label}</div>
                      <div className="text-xl font-bold font-mono text-slate-100 mt-1">{km.value}</div>
                      <div
                        className={`text-[11px] font-mono mt-0.5 ${
                          km.change.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {km.change}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Report Sections */}
              <div className="space-y-6">
                {selectedReport.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-base font-bold text-slate-100 border-b border-slate-800/80 pb-1.5">
                      {sec.title}
                    </h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </div>

                    {/* Section Breakdown Table */}
                    {sec.table && (
                      <div className="border border-slate-800 rounded-xl overflow-hidden mt-3">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                              {sec.table.columns.map((c) => (
                                <th key={c} className="py-2.5 px-3.5">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-800/30">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-2 px-3.5">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Recommended Actions */}
              {selectedReport.recommended_actions && (
                <div className="bg-blue-950/20 border border-blue-900/40 p-5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    Recommended Strategic Next Steps
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {selectedReport.recommended_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">{idx + 1}.</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methodology & Limitations */}
              {selectedReport.methodology_and_limitations && (
                <div className="border-t border-slate-800 pt-5 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Methodology & Governance Boundaries
                  </h4>
                  <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                    {selectedReport.methodology_and_limitations.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-20">
              No report selected. Generate or select a report to view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
