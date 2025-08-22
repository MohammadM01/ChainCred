import React, { useState } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';
import Header from '../components/Header';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const handleWeb3AuthLogin = async () => {
    setLoading(true);
    // This is just UI demo - no actual functionality
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-400">
      <Header />
      
      {/* Main Container */}
      <div className="flex items-center justify-center min-h-[90vh] px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-yellow-400">CC</span>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Welcome to ChainCred</h1>
            <p className="text-gray-800">Secure, decentralized credential management</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-yellow-200">
            
            {/* Toggle Buttons */}
            <div className="flex bg-yellow-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  isSignUp 
                    ? 'bg-yellow-400 text-black shadow-md' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  !isSignUp 
                    ? 'bg-yellow-400 text-black shadow-md' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isSignUp 
                  ? 'Connect your wallet to get started' 
                  : 'Sign in to access your credentials'
                }
              </p>
            </div>

            {/* Web3Auth Login Button */}
            <button
              onClick={handleWeb3AuthLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span>{isSignUp ? 'Connect Wallet & Sign Up' : 'Connect Wallet & Sign In'}</span>
                </div>
              )}
            </button>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.965 1.404-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Role Selection for Sign Up */}
            {isSignUp && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose your role:</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button className="px-3 py-2 text-xs font-medium bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                    🎓 Student
                  </button>
                  <button className="px-3 py-2 text-xs font-medium bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                    🏫 Institute
                  </button>
                  <button className="px-3 py-2 text-xs font-medium bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                    ✅ Verifier
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-yellow-600 hover:text-yellow-700 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-yellow-600 hover:text-yellow-700 underline">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-8 text-black/70">
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-black/50 rounded-full"></span>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-black/50 rounded-full"></span>
                <span>Decentralized</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-black/50 rounded-full"></span>
                <span>Tamper-proof</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-4 -left-4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
