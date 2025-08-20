import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProLanding = lazy(() => import('./pages/ProLanding'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthBinance = lazy(() => import('./pages/AuthBinance'));
const DashboardBinance = lazy(() => import('./pages/DashboardBinance'));
const SignIn = lazy(() => import('./pages/SignIn'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>}>
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
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}