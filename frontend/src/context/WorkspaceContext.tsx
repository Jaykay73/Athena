import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, Dataset } from '../types';
import { api } from '../api/client';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  datasets: Dataset[];
  activeDataset: Dataset | null;
  setActiveDataset: (ds: Dataset | null) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshDatasets: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshWorkspaces = async () => {
    try {
      const data = await api.getWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0]);
      }
    } catch (e) {
      console.error('Failed to load workspaces', e);
    }
  };

  const refreshDatasets = async () => {
    if (!activeWorkspace) return;
    try {
      const data = await api.getDatasets(activeWorkspace.id);
      setDatasets(data);
      if (data.length > 0 && !activeDataset) {
        // Default to sales_transactions if available
        const preferred = data.find((d) => d.name.includes('sales')) || data[0];
        setActiveDataset(preferred);
      }
    } catch (e) {
      console.error('Failed to load datasets', e);
    }
  };

  useEffect(() => {
    refreshWorkspaces().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      refreshDatasets();
    }
  }, [activeWorkspace?.id]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        datasets,
        activeDataset,
        setActiveDataset,
        refreshWorkspaces,
        refreshDatasets,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
