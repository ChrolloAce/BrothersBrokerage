import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Pipelines from './pages/Pipelines';
import Leads from './pages/Leads';
import Budgets from './pages/Budgets';
import Documents from './pages/Documents';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="pipelines" element={<Pipelines />} />
            <Route path="leads" element={<Leads />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="documents" element={<Documents />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </ProtectedRoute>
    </div>
  );
}

export default App; 