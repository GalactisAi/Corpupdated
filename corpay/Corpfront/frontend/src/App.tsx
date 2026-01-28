import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RevenueManagement from './pages/RevenueManagement'
import PostsManagement from './pages/PostsManagement'
import EmployeesManagement from './pages/EmployeesManagement'
import PaymentsManagement from './pages/PaymentsManagement'
import SystemManagement from './pages/SystemManagement'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="revenue" element={<RevenueManagement />} />
        <Route path="posts" element={<PostsManagement />} />
        <Route path="employees" element={<EmployeesManagement />} />
        <Route path="payments" element={<PaymentsManagement />} />
        <Route path="system" element={<SystemManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App

