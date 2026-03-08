/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import About from './pages/public/About';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Protected Pages
import Dashboard from './pages/protected/Dashboard';
import BrowseLoans from './pages/protected/BrowseLoans';
import LoanDetails from './pages/protected/LoanDetails';
import ApplyLoan from './pages/protected/ApplyLoan';
import MyLoans from './pages/protected/MyLoans';
import MyInvestments from './pages/protected/MyInvestments';
import Transactions from './pages/protected/Transactions';
import Wallet from './pages/protected/Wallet';
import Profile from './pages/protected/Profile';
import Settings from './pages/protected/Settings';
import Admin from './pages/protected/Admin';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/loans/browse" element={<ProtectedRoute role="lender"><BrowseLoans /></ProtectedRoute>} />
            <Route path="/loans/:id" element={<ProtectedRoute><LoanDetails /></ProtectedRoute>} />
            <Route path="/loans/apply" element={<ProtectedRoute role="borrower"><ApplyLoan /></ProtectedRoute>} />
            <Route path="/my-loans" element={<ProtectedRoute role="borrower"><MyLoans /></ProtectedRoute>} />
            <Route path="/my-investments" element={<ProtectedRoute role="lender"><MyInvestments /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
