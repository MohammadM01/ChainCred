import Header from '../components/Header';
import { useState } from 'react';
import axios from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import scene from '/assets/scene.splinecode';

export default function LandingPage(){
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function quickVerify(e){
    e.preventDefault();
    if(!q) return;
    setLoading(true);
    try{
      const res = await axios.get(`/api/verify?${q.includes('0x') ? `studentWallet=${q}` : `certificateID=${q}`}`);
      setResult(res.data.data || res.data);
    }catch(err){
      setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    }finally{setLoading(false)}
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="relative h-[70vh] w-full overflow-hidden">
        {/* Hero background */}
        <Spline scene={scene} />
        {/* Hero content overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">Fraud-proof credentials with ChainCred 🚀</h1>
              <p className="mt-4 text-gray-200">Tamper-proof, decentralized, verifiable on opBNB + Greenfield.</p>
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-yellow-400 text-black rounded" onClick={()=>navigate('/auth')}>Get Started</button>
                <button className="px-4 py-2 border border-yellow-400 rounded text-yellow-400" onClick={()=>navigate('/verify')}>Verify a Credential</button>
              </div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm border border-yellow-400 p-6 rounded">
              <h3 className="font-semibold">Quick Verify</h3>
              <form className="mt-3" onSubmit={quickVerify}>
                <input className="w-full p-2 bg-transparent text-white border border-gray-700 rounded" placeholder="Certificate ID or Wallet" value={q} onChange={e=>setQ(e.target.value)} />
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" className="px-3 py-1 border border-gray-600 rounded text-gray-300" onClick={()=>{setQ('');setResult(null);}}>Clear</button>
                  <button className="px-3 py-1 bg-yellow-400 text-black rounded" disabled={loading}>{loading ? 'Checking...' : 'Verify'}</button>
                </div>
              </form>
              <div className="mt-4">
                {result && (result.valid ? <div className="text-green-400">✅ Valid credential — {result.metadata?.certificateID}</div> : <div className="text-red-400">❌ Invalid — {result.error || 'Not found'}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gray-900 p-6 rounded">
          <h2 className="text-2xl">About</h2>
          <p className="mt-3 text-gray-300">Problem: fake resumes and forged certificates plague hiring and admissions.
          Solution: Soulbound NFTs + Greenfield storage make credentials tamper-proof and instantly verifiable.
          We use the BNB ecosystem (opBNB + Greenfield) for fast, cheap, scalable verification and storage.</p>
        </div>

        <footer className="mt-8 flex justify-between text-sm text-gray-400">
          <div>
            <a href="https://github.com" className="mr-4">GitHub</a>
            <a href="#" className="mr-4">Docs</a>
            <a href="#">Privacy</a>
          </div>
          <div>Hackathon Badge</div>
        </footer>
      </section>
    </div>
  )
}
