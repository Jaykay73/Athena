import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BarChart3, Database, Sparkles, FileText, Bookmark,
  CheckCircle2, Settings, ShieldCheck, ChevronDown, Layers
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Sidebar: React.FC = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: BarChart3 },
    { to: '/data', label: 'Data', icon: Database },
    { to: '/analyze', label: 'Analyze', icon: Sparkles },
    { to: '/insights', label: 'Insights', icon: Layers },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/saved', label: 'Saved Analyses', icon: Bookmark },
    { to: '/evaluations', label: 'Evaluation', icon: CheckCircle2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d121d] border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg tracking-wider">
            A
          </div>
          <div>
            <div className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              ATHENA
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PROD
              </span>
            </div>
            <div className="text-[11px] text-slate-400">AI Data Analyst</div>
          </div>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
          Active Workspace
        </div>
        <div className="relative">
          <select
            value={activeWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              if (ws) setActiveWorkspace(ws);
            }}
            className="w-full bg-slate-900/80 border border-slate-800 text-xs rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-7 font-medium"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="leading-tight">
            <div className="font-medium text-[11px] text-slate-200">Computation Verified</div>
            <div className="text-[10px] text-emerald-400 font-mono">No Hallucination Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
