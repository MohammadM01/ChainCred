// frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProLanding = lazy(() => import('./pages/ProLanding'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthBinance = lazy(() => import('./pages/AuthBinance'));
const DashboardBinance = lazy(() => import('./pages/DashboardBinance'));
const SignIn = lazy(() => import('./pages/SignIn')); // New SignIn page

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<ProLanding />} />
          <Route path="/auth" element={<AuthBinance />} />
          <Route path="/auth-binance" element={<AuthBinance />} />
          <Route path="/auth-legacy" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard-binance" element={<DashboardBinance />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sign-in" element={<SignIn />} /> {/* New route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast container must be inside BrowserRouter but outside Routes */}
        <ToastContainer position="top-right" autoClose={3000} />
      </Suspense>
    </BrowserRouter>
  );
}
