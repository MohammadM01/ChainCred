import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileFormEnhanced from '../components/ProfileFormEnhanced';
import UploadCertificate from '../components/UploadCertificate';
import ResumePreview from '../components/ResumePreview';
import axios from '../utils/api';

const ResumeBuilder = () => {
  const { user } = useUser();
  const [profileSaved, setProfileSaved] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.wallet) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/certificates/student/${user.wallet}`);
      setCertificates(res.data?.data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-gray-400">Please connect your wallet to access the resume builder</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
            <p className="text-gray-400">This feature is only available for students</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            Build Your ChainCred Resume
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create a professional resume showcasing your blockchain credentials and achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🎓</div>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <div className="text-blue-100">Total Credentials</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">{certificates.filter(c => c.status === 'minted').length}</div>
            <div className="text-green-100">Verified Credentials</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🔗</div>
            <div className="text-2xl font-bold">{certificates.filter(c => c.txHash).length}</div>
            <div className="text-purple-100">On Blockchain</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👤 Profile & Skills
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
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'preview'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👁️ Preview Resume
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'profile' && (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Personal Profile</h2>
                <p className="text-gray-400">Complete your professional information and skills</p>
              </div>
              <ProfileFormEnhanced wallet={user.wallet} onSave={() => setProfileSaved(true)} />
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Your Credentials</h2>
                <p className="text-gray-400">Manage and showcase your blockchain certificates</p>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading certificates...</p>
                </div>
              ) : certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-400 transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">🏆</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cert.status === 'minted' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {cert.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-500">Certificate ID</div>
                        <div className="font-mono text-xs text-yellow-400 break-all">
                          {cert.certificateID?.slice(0, 20)}...
                        </div>
                        
                        <div className="text-sm text-gray-500">Issuer</div>
                        <div className="font-mono text-xs text-gray-300">
                          {cert.issuerWallet?.slice(0, 8)}...{cert.issuerWallet?.slice(-6)}
                        </div>
                        
                        <div className="text-sm text-gray-500">Date</div>
                        <div className="text-xs text-gray-300">
                          {new Date(cert.issuedDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {cert.fileUrl && (
                          <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors">
                            📄 View PDF
                          </button>
                        )}
                        {cert.txHash && (
                          <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors">
                            🔗 Blockchain
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📜</div>
                  <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                  <p className="text-gray-400 mb-6">Start building your credential portfolio</p>
                  <UploadCertificate wallet={user.wallet} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Resume Preview</h2>
                <p className="text-gray-400">See how your resume will look with your credentials</p>
              </div>
              {profileSaved ? (
                <ResumePreview wallet={user.wallet} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Complete Your Profile First</h3>
                  <p className="text-gray-400 mb-6">Save your profile information to see the resume preview</p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                  >
                    Go to Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResumeBuilder;
