import React from 'react'
import LandingPage from './pages/LandingPage';
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InstituteDashboard from './pages/InstituteDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VerificationPage from './pages/VerificationPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className='h-screen w-screen'>
      <Spline scene={scene} />
      <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/institute" element={<InstituteDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/verify" element={<VerificationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
    </div>
  );
}

export default App

