import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VerifyPage from './pages/VerifyPage';
import Profile from './pages/Profile';
import { UserProvider } from './context/UserContext';

function Root() {
	return (
		<React.StrictMode>
			<UserProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route path="/auth" element={<AuthPage />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/verify" element={<VerifyPage />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</BrowserRouter>
			</UserProvider>
		</React.StrictMode>
	);
}

createRoot(document.getElementById('root')).render(<Root />);
