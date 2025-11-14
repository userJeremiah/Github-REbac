import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { Toast } from './components/common/Toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { Teams } from './pages/Teams';
import { PullRequests } from './pages/PullRequests';
import { Permissions } from './pages/Permissions';
import { AuditLog } from './pages/AuditLog';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/repositories"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Repositories />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Teams />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pull-requests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PullRequests />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/permissions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Permissions />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AuditLog />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Toast />
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
