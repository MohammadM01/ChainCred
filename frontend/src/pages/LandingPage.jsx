import Header from '../components/Header';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${base}/api/verify?${q.includes('0x') ? `studentWallet=${q}` : `certificateID=${q}`}`);
      setResult(res.data.data);
    }catch(err){
      setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    }finally{setLoading(false)}
  }

  return (<div className="min-h-screen bg-black text-white px-6">
    <Header />
    <section className="max-w-6xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold">Fraud-proof credentials with ChainCred 🚀</h1>
          <p className="mt-4 text-gray-300">Tamper-proof, decentralized, verifiable on opBNB + Greenfield.</p>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-yellow-400 text-black rounded" onClick={()=>navigate('/auth')}>Get Started</button>
            <button className="px-4 py-2 border border-yellow-400 rounded" onClick={()=>navigate('/verify')}>Verify a Credential</button>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded">
          <h3 className="font-semibold">Quick Verify</h3>
          <form className="mt-3" onSubmit={quickVerify}>
            <input className="w-full p-2 bg-black text-white border" placeholder="Certificate ID or Wallet" value={q} onChange={e=>setQ(e.target.value)} />
            <div className="mt-3 flex justify-end">
              <button className="px-3 py-1 bg-yellow-400 text-black rounded" disabled={loading}>{loading ? 'Checking...' : 'Verify'}</button>
            </div>
          </form>
          <div className="mt-4">
            {result && (result.valid ? <div className="text-green-400">✅ Valid credential — {result.metadata?.certificateID}</div> : <div className="text-red-400">❌ Invalid — {result.error || 'Not found'}</div>)}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-gray-900 p-6 rounded">
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
  </div>)
}
