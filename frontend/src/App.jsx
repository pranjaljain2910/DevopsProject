/**
 * App.jsx — Root layout with sidebar, navbar, and routing
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AlertSimulation from './pages/AlertSimulation';
import RulesPage from './pages/RulesPage';
import EscalationPolicies from './pages/EscalationPolicies';
import UsersTeams from './pages/UsersTeams';

const SIDEBAR_EXPANDED = 250;
const SIDEBAR_COLLAPSED = 72;

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  // Auto-collapse on small screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handler = (e) => setSidebarCollapsed(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          width={sidebarWidth}
        />

        <div
          style={{
            marginLeft: sidebarWidth,
            flex: 1,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Navbar />

          <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/simulate" element={<AlertSimulation />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/escalation" element={<EscalationPolicies />} />
              <Route path="/users-teams" element={<UsersTeams />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
