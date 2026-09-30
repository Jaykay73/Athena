import {
  Workspace, Dataset, DatasetProfile, Analysis,
  AutonomousInvestigation, Report, EvaluationRun
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return request<Workspace[]>('/workspaces');
  },
  async createWorkspace(name: string, description?: string): Promise<Workspace> {
    return request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  // Datasets
  async getDatasets(workspaceId?: string): Promise<Dataset[]> {
    const query = workspaceId ? `?workspace_id=${workspaceId}` : '';
    return request<Dataset[]>(`/datasets${query}`);
  },
  async getDataset(id: string): Promise<Dataset> {
    return request<Dataset>(`/datasets/${id}`);
  },
  async getDatasetProfile(id: string): Promise<DatasetProfile> {
    return request<DatasetProfile>(`/datasets/${id}/profile`);
  },
  async getDatasetPreview(id: string, limit: number = 20): Promise<any> {
    return request<any>(`/datasets/${id}/preview?limit=${limit}`);
  },
  async uploadDataset(formData: FormData): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return response.json();
  },

  // Analyses
  async getAnalyses(workspaceId?: string): Promise<Analysis[]> {
    const query = workspaceId ? `?workspace_id=${workspaceId}` : '';
    return request<Analysis[]>(`/analyses${query}`);
  },
  async getAnalysis(id: string): Promise<Analysis> {
    return request<Analysis>(`/analyses/${id}`);
  },
  async createAnalysis(workspaceId: string, question: string, datasetId?: string): Promise<Analysis> {
    return request<Analysis>('/analyses', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspaceId,
        question,
        dataset_id: datasetId,
      }),
    });
  },
  async challengeAnalysis(id: string): Promise<any> {
    return request<any>(`/analyses/${id}/challenge`, { method: 'POST' });
  },
  async toggleSaveAnalysis(id: string): Promise<{ id: string; is_saved: boolean }> {
    return request<{ id: string; is_saved: boolean }>(`/analyses/${id}/save`, { method: 'POST' });
  },
  async rerunAnalysis(id: string): Promise<Analysis> {
    return request<Analysis>(`/analyses/${id}/rerun`, { method: 'POST' });
  },

  // Insights / Autonomous Investigation
  async scanDataset(datasetId: string): Promise<AutonomousInvestigation> {
    return request<AutonomousInvestigation>(`/insights/scan?dataset_id=${datasetId}`, { method: 'POST' });
  },

  // Reports
  async getReports(workspaceId?: string): Promise<Report[]> {
    const query = workspaceId ? `?workspace_id=${workspaceId}` : '';
    return request<Report[]>(`/reports${query}`);
  },
  async getReport(id: string): Promise<Report> {
    return request<Report>(`/reports/${id}`);
  },
  async createReport(workspaceId: string, title: string, subtitle?: string, datasetId?: string): Promise<Report> {
    return request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspaceId,
        title,
        subtitle,
        dataset_id: datasetId,
      }),
    });
  },
  getReportExportUrl(reportId: string, format: 'pdf' | 'markdown' | 'html'): string {
    return `${API_BASE}/reports/${reportId}/export/${format}`;
  },

  // Evaluations
  async getLatestEvaluation(): Promise<EvaluationRun> {
    return request<EvaluationRun>('/evaluations/latest');
  },
  async runEvaluationSuite(): Promise<EvaluationRun> {
    return request<EvaluationRun>('/evaluations/run', { method: 'POST' });
  },

  // Settings
  async getSettings(): Promise<any> {
    return request<any>('/settings');
  },
};
