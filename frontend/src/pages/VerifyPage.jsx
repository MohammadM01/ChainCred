import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import axios, { BASE_URL } from '../utils/api';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VerifyPage(){
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(!q) return;
    setLoading(true);
    try{
      const res = await axios.get(`${BASE_URL}/api/verify?${q.includes('0x') ? `studentWallet=${q}` : `certificateID=${q}`}`);
      setResult(res.data.data || res.data);
    }catch(err){
      setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    const id = searchParams.get('certificateID');
    const wallet = searchParams.get('studentWallet');
    const param = id || wallet;
    if(param){
      setQ(param);
      // auto-submit
      (async ()=>{
        setLoading(true);
        try{
          const res = await axios.get(`${BASE_URL}/api/verify?${param.includes('0x') ? `studentWallet=${param}` : `certificateID=${param}`}`);
          setResult(res.data.data || res.data);
        }catch(err){
          setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
        }finally{ 
          setLoading(false); 
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#f3ba2f] mb-4">🔍 Verify Credential</h1>
          <p className="text-gray-400">Enter a Certificate ID or Student Wallet to verify authenticity</p>
        </div>

        <form className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg" onSubmit={submit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Certificate ID or Student Wallet
            </label>
            <input 
              className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f] transition" 
              placeholder="Enter Certificate ID or 0x... wallet address" 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
            />
          </div>
          <div className="flex justify-end">
            <button 
              className="px-6 py-2 bg-[#f3ba2f] text-black font-semibold rounded-lg hover:bg-[#e0a923] transition-colors disabled:opacity-60" 
              disabled={loading}
            >
              {loading ? '🔍 Verifying...' : '🔍 Verify Credential'}
            </button>
          </div>
        </form>

        <div className="mt-8">
          {result && (
            result.valid ? (
              <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl">
                <div className="text-green-400 font-semibold text-xl mb-4 flex items-center gap-2">
                  ✅ Valid Credential
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400">Student:</span> 
                      <span className="text-yellow-400 font-medium ml-2">{result.metadata?.studentName || 'Unknown'}</span>
                    </div>
                    <div className="text-gray-500 font-mono text-xs break-all">
                      {result.metadata?.studentWallet}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-400">Issuer:</span> 
                    <span className="text-yellow-400 font-medium ml-2">{result.metadata?.issuerName || 'Unknown'}</span>
                    <div className="text-gray-500 font-mono text-xs break-all">
                      {result.metadata?.issuerWallet}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div><span className="text-gray-400">Issued:</span> <span className="text-white ml-2">{result.metadata?.issuedDateISO}</span></div>
                  <div><span className="text-gray-400">Certificate ID:</span> <span className="text-white font-mono ml-2 break-all">{result.metadata?.certificateID}</span></div>
                  <div><span className="text-gray-400">Status:</span> <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    result.status === 'minted' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>{result.status || 'pending'}</span></div>
                  {result.tokenId && (
                    <div><span className="text-gray-400">Token ID:</span> <span className="text-green-400 font-bold ml-2">#{result.tokenId}</span></div>
                  )}
                  <div className="pt-3 flex gap-3">
                    <a 
                      className="text-yellow-400 hover:text-yellow-300 hover:underline flex items-center gap-2" 
                      href={`${BASE_URL}${result.pdfUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      📄 Open PDF
                    </a>
                    <a 
                      className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2" 
                      href={`${BASE_URL}${result.metadataUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      📋 View Metadata
                    </a>
                  </div>
                  {result.metadata?.txHash && (
                    <div className="pt-2">
                      <span className="text-gray-400">Transaction:</span> 
                      <a 
                        className="text-yellow-400 hover:text-yellow-300 hover:underline ml-2 flex items-center gap-2" 
                        href={`https://opbnb-testnet.bscscan.com/tx/${result.metadata?.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        🔗 View on opBNB Explorer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl">
                <div className="text-red-400 font-semibold text-xl mb-3 flex items-center gap-2">
                  ❌ Credential Not Verified
                </div>
                <div className="text-gray-300">
                  {result.error || 'The credential could not be verified. Please check the Certificate ID or Wallet address.'}
                </div>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
