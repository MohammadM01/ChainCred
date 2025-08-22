import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';

export default function Profile() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.wallet) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const q = user.role === 'institute' ? `issuerWallet=${user.wallet}` : `studentWallet=${user.wallet}`;
      const res = await axios.get(`/api/verify?${q}`);
      setCertificates(res.data.data?.items || res.data.data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-gray-400">Please connect your wallet to view your profile</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalCertificates = certificates.length;
  const verifiedCertificates = certificates.filter(c => c.status === 'minted' || c.metadata?.valid).length;
  const blockchainCertificates = certificates.filter(c => c.txHash || c.metadata?.txHash).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
            <span className="text-4xl">👤</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            Your Profile
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your blockchain identity and view your credential portfolio
          </p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-yellow-400">Profile Information</h2>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 uppercase tracking-wide">Wallet Address</label>
                <div className="mt-1 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <code className="text-yellow-400 font-mono text-sm break-all">{user.wallet}</code>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 uppercase tracking-wide">Role</label>
                <div className="mt-1 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'institute' 
                      ? 'bg-purple-900 text-purple-300' 
                      : user.role === 'student'
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {user.role === 'institute' ? '🏫 Institute' : user.role === 'student' ? '🎓 Student' : '🔍 Verifier'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 uppercase tracking-wide">Connection Status</label>
                <div className="mt-1 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Wallet Connected</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 uppercase tracking-wide">Network</label>
                <div className="mt-1 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <span className="text-blue-400">opBNB Testnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-3xl font-bold">{totalCertificates}</div>
            <div className="text-blue-100 text-lg">Total Credentials</div>
            <div className="text-blue-200 text-sm mt-1">
              {user.role === 'institute' ? 'Issued' : 'Received'}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-3xl font-bold">{verifiedCertificates}</div>
            <div className="text-green-100 text-lg">Verified</div>
            <div className="text-green-200 text-sm mt-1">On Blockchain</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-4xl mb-3">🔗</div>
            <div className="text-3xl font-bold">{blockchainCertificates}</div>
            <div className="text-purple-100 text-lg">Blockchain</div>
            <div className="text-purple-200 text-sm mt-1">Immutable</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'certificates'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🏆 Certificates
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📈 Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Portfolio Overview</h2>
                <p className="text-gray-400">A comprehensive view of your blockchain credentials</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Credentials</span>
                        <span className="text-2xl font-bold text-blue-400">{totalCertificates}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Verification Rate</span>
                        <span className="text-2xl font-bold text-green-400">
                          {totalCertificates > 0 ? Math.round((verifiedCertificates / totalCertificates) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Blockchain Coverage</span>
                        <span className="text-2xl font-bold text-purple-400">
                          {totalCertificates > 0 ? Math.round((blockchainCertificates / totalCertificates) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">Recent Activity</h3>
                    {certificates.length > 0 ? (
                      <div className="space-y-3">
                        {certificates.slice(0, 3).map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                            <div className="text-2xl">🏆</div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-200">
                                {cert.metadata?.certificateID || cert.certificateID || 'Certificate'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(cert.metadata?.issuedDateISO || cert.issuedDate || Date.now()).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cert.status === 'minted' || cert.metadata?.valid
                                ? 'bg-green-900 text-green-300'
                                : 'bg-yellow-900 text-yellow-300'
                            }`}>
                              {cert.status === 'minted' || cert.metadata?.valid ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📜</div>
                        <p className="text-gray-400">No certificates yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  {user.role === 'institute' ? 'Issued Certificates' : 'My Certificates'}
                </h2>
                <p className="text-gray-400">Manage and view all your blockchain credentials</p>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading certificates...</p>
                </div>
              ) : certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-400 transition-all duration-200 transform hover:scale-105">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">🏆</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cert.status === 'minted' || cert.metadata?.valid
                            ? 'bg-green-900 text-green-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {cert.status === 'minted' || cert.metadata?.valid ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Certificate ID</div>
                          <div className="font-mono text-xs text-yellow-400 break-all">
                            {cert.metadata?.certificateID || cert.certificateID || 'N/A'}
                          </div>
                        </div>
                        
                        {user.role === 'institute' ? (
                          <div>
                            <div className="text-sm text-gray-500">Student</div>
                            <div className="font-mono text-xs text-gray-300">
                              {cert.metadata?.studentWallet || cert.studentWallet || 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm text-gray-500">Issuer</div>
                            <div className="font-mono text-xs text-gray-300">
                              {cert.metadata?.issuerWallet || cert.issuerWallet || 'N/A'}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="text-xs text-gray-300">
                            {new Date(cert.metadata?.issuedDateISO || cert.issuedDate || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {cert.metadata?.fileUrl && (
                          <a 
                            href={cert.metadata.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs text-center transition-colors"
                          >
                            📄 View PDF
                          </a>
                        )}
                        {cert.metadata?.txHash && (
                          <a 
                            href={`https://opbnb-testnet.bscscan.com/tx/${cert.metadata.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs text-center transition-colors"
                          >
                            🔗 Blockchain
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📜</div>
                  <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                  <p className="text-gray-400 mb-6">
                    {user.role === 'institute' 
                      ? 'Start issuing credentials to students' 
                      : 'Build your credential portfolio by receiving certificates from institutes'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Activity Timeline</h2>
                <p className="text-gray-400">Track your credential activities and achievements</p>
              </div>
              
              <div className="space-y-6">
                {certificates.length > 0 ? (
                  certificates.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xl">🏆</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-200">
                            {cert.status === 'minted' || cert.metadata?.valid ? 'Credential Verified' : 'Credential Received'}
                          </h4>
                          <span className="text-sm text-gray-400">
                            {new Date(cert.metadata?.issuedDateISO || cert.issuedDate || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-2">
                          {user.role === 'institute' 
                            ? `Issued certificate to ${cert.metadata?.studentWallet || cert.studentWallet || 'student'}`
                            : `Received certificate from ${cert.metadata?.issuerWallet || cert.issuerWallet || 'institute'}`
                          }
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>ID: {cert.metadata?.certificateID || cert.certificateID || 'N/A'}</span>
                          {cert.metadata?.txHash && (
                            <span>• TX: {cert.metadata.txHash.slice(0, 8)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-400">No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
