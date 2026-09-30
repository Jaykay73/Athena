import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Database, AlertTriangle, ArrowRight, FileCheck, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../api/client';

export const DataPage: React.FC = () => {
  const { activeWorkspace, datasets, refreshDatasets } = useWorkspace();
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspace) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace_id', activeWorkspace.id);
    formData.append('dataset_name', file.name.split('.')[0]);

    try {
      await api.uploadDataset(formData);
      setUploadSuccess(`Successfully ingested and profiled ${file.name}`);
      await refreshDatasets();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Data Management & Profiling</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated deterministic profiling, schema typing, quality scoring, and anomaly detection.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-[#101725] border border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-xl p-8 text-center transition">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Upload Business Data for Investigation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports CSV, Excel (.xlsx), Parquet, and JSON files up to 100MB.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition shadow-md shadow-blue-600/20">
            <span>{uploading ? 'Profiling & Ingesting...' : 'Select File to Upload'}</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.parquet,.json"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploadError && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded text-center">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* Datasets Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Loaded Datasets ({datasets.length})
        </h2>

        <div className="bg-[#101725] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Dataset Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Rows</th>
                <th className="py-3 px-4">Columns</th>
                <th className="py-3 px-4">Data Quality</th>
                <th className="py-3 px-4">Warnings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {datasets.map((ds) => {
                const warningsCount = ds.quality_warnings?.length || 0;
                return (
                  <tr key={ds.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-100 flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ds.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-[10px] text-slate-400">
                      {ds.file_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {ds.row_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {ds.column_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono font-medium px-2 py-0.5 rounded text-[10px] ${
                          ds.data_quality_score >= 90
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ds.data_quality_score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {warningsCount > 0 ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{warningsCount} warnings</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/data/${ds.id}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <span>Profile & Preview</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
