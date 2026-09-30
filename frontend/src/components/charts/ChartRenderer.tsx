import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { ChartSpec } from '../../types';

interface ChartRendererProps {
  spec: ChartSpec;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ spec }) => {
  const { title, chart_type, data, x_axis, y_axis, units, source, date_range } = spec;

  const formatNumber = (val: any) => {
    if (typeof val !== 'number') return val;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-2.5 rounded shadow-xl text-xs">
          <div className="font-semibold text-slate-200 mb-1">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="font-mono font-medium text-slate-100">
                {units === '$' ? '$' : ''}{formatNumber(entry.value)}{units && units !== '$' ? units : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#101725] border border-slate-800 rounded-lg p-4 my-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-200 tracking-tight">{title}</h4>
          {date_range && (
            <span className="text-[10px] text-slate-400 font-mono">{date_range}</span>
          )}
        </div>
        {units && (
          <span className="text-[10px] text-slate-400 uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800">
            Units: {units}
          </span>
        )}
      </div>

      {/* Responsive Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart_type === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey={x_axis} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={y_axis} stroke="#3b82f6" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : chart_type === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey={x_axis} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              {/* Check if comparison bar chart */}
              {data.length > 0 && 'Prior Period (Q2)' in data[0] ? (
                <>
                  <Bar dataKey="Prior Period (Q2)" fill="#475569" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Current Period (Q3)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }} />
                </>
              ) : (
                <Bar dataKey={y_axis} fill="#3b82f6" radius={[3, 3, 0, 0]} />
              )}
            </BarChart>
          ) : chart_type === 'scatter' ? (
            <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="x" name={x_axis} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis dataKey="y" name={y_axis} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatNumber} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="Data Points" data={data} fill="#38bdf8" />
            </ScatterChart>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Unsupported chart type: {chart_type}
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Provenance */}
      {source && (
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1.5">
          <span>Source: {source}</span>
          <span className="font-mono">Athena Analytical Engine</span>
        </div>
      )}
    </div>
  );
};
