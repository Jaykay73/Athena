import React from 'react';
import { Database, Plus, Search, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { datasets, activeDataset, setActiveDataset } = useWorkspace();

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0b0f17]/90 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Active Dataset Indicator */}
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Dataset:</span>
          <select
            value={activeDataset?.id || ''}
            onChange={(e) => {
              const ds = datasets.find((d) => d.id === e.target.value);
              setActiveDataset(ds || null);
            }}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500 font-mono"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.row_count.toLocaleString()} rows)
              </option>
            ))}
          </select>
        </div>

        {activeDataset && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            <span>Quality:</span>
            <span
              className={`font-mono font-medium px-1.5 py-0.5 rounded text-[10px] ${
                activeDataset.data_quality_score >= 90
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {activeDataset.data_quality_score}/100
            </span>
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/data"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Data</span>
        </Link>
        <Link
          to="/analyze"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Investigation</span>
        </Link>
      </div>
    </header>
  );
};
