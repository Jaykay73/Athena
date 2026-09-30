import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DataPage } from './pages/DataPage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { InsightsPage } from './pages/InsightsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SavedAnalysesPage } from './pages/SavedAnalysesPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Main SaaS Platform within Master Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/data/:id" element={<DatasetDetailPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/analysis/:id" element={<AnalyzePage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportsPage />} />
            <Route path="/saved" element={<SavedAnalysesPage />} />
            <Route path="/evaluations" element={<EvaluationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}

export default App;
