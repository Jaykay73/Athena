import React from 'react';
import { GitCommit, ArrowRight, Database, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { LineageGraph } from '../../types';

interface LineageViewerProps {
  lineage?: LineageGraph;
}

export const LineageViewer: React.FC<LineageViewerProps> = ({ lineage }) => {
  if (!lineage || !lineage.nodes || lineage.nodes.length === 0) {
    return (
      <div className="text-xs text-slate-500 py-4 text-center">
        No lineage graph available.
      </div>
    );
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="w-3.5 h-3.5 text-blue-400" />;
      case 'dataset': return <Database className="w-3.5 h-3.5 text-indigo-400" />;
      case 'column': return <Layers className="w-3.5 h-3.5 text-slate-400" />;
      case 'query': return <GitCommit className="w-3.5 h-3.5 text-amber-400" />;
      case 'metric': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="text-xs font-semibold text-slate-200">Data Lineage & Provenance Graph</div>
        <span className="text-[10px] text-slate-400 font-mono">End-to-End Lineage</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 py-2">
        {lineage.nodes.map((node, idx) => (
          <React.Fragment key={node.id}>
            <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-md flex items-center gap-2 max-w-[200px] shadow-sm">
              <div className="p-1.5 rounded bg-slate-800/80">
                {getNodeIcon(node.type)}
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-medium text-slate-200 truncate">{node.label}</div>
                {node.details && (
                  <div className="text-[10px] text-slate-400 font-mono truncate">{node.details}</div>
                )}
              </div>
            </div>
            {idx < lineage.nodes.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
