import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import { UserProvider } from './context/UserContext';

function Root() {
	return (
		<React.StrictMode>
			<UserProvider>
				<App />
			</UserProvider>
		</React.StrictMode>
	);
}

createRoot(document.getElementById('root')).render(<Root />);
