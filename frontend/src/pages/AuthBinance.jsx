import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';
import { initWeb3Auth } from '../utils/web3auth';

export default function AuthBinance(){
  const { setUser, showToast } = useUser();
  const [wallet, setWallet] = useState(null);
  const [role, setRole] = useState('institute');
  const [name, setName] = useState('');
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const navigate = useNavigate();

  async function connectWallet(){
    setLoadingConnect(true);
    try{
      const addr = await initWeb3Auth();
      if(addr){
        setWallet(addr);
        showToast('success', 'Wallet connected');
      }
    }catch{
      showToast('error', 'Failed to connect wallet');
    }finally{
      setLoadingConnect(false);
    }
  }

  async function register(){
    if(!wallet) return showToast('error', 'Connect your wallet');
    setLoadingRegister(true);
    try{
      const res = await axios.post(`/api/auth/register`, { wallet, role, name });
      const nextUser = res.data?.data?.user || res.data?.user;
      if(nextUser){
        setUser(nextUser);
        showToast('success', 'Registered successfully');
      } else {
        showToast('error', 'Unexpected response');
      }
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Register failed');
    }finally{
      setLoadingRegister(false);
    }
  }

  async function verifyWallet(){
    if(!wallet) return showToast('error', 'Connect your wallet');
    setLoadingVerify(true);
    try{
      const message = 'Sign this to verify: ChainCred';
      const signature = await window.ethereum?.request?.({ method: 'personal_sign', params: [message, wallet] }).catch(()=>null);
      if(!signature) return showToast('error', 'Signature was rejected');
      const res = await axios.post(`/api/auth/verify-wallet`, { wallet, message, signature });
      if(res.data?.success){
        showToast('success', 'Wallet verified');
        // Set the user in context after successful verification
        const nextUser = res.data?.data?.user || res.data?.user;
        if (nextUser) {
          setUser(nextUser);
        }
        navigate('/dashboard-binance');
      }else{
        showToast('error', 'Verification failed');
      }
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Verify failed');
    }finally{
      setLoadingVerify(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero / Intro */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left: Auth Card */}
          <div className="flex-1 w-full">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-[#f3ba2f]">Binance</span>-style Login & Signup
              </h1>
              <p className="mt-2 text-gray-400">Securely connect, register your role, and verify your wallet.</p>

              {/* Wallet section */}
              <div className="mt-6 space-y-3">
                <div className="text-sm text-gray-300">Wallet: {wallet ? <span className="font-mono">{wallet}</span> : 'Not connected'}</div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={connectWallet} className="px-4 py-2 rounded font-semibold bg-[#f3ba2f] text-black hover:brightness-95 transition disabled:opacity-60" disabled={loadingConnect}>
                    {loadingConnect ? 'Connecting…' : 'Connect Wallet'}
                  </button>
                  <button onClick={verifyWallet} className="px-4 py-2 rounded font-semibold border-2 border-[#f3ba2f] text-[#f3ba2f] hover:bg-[#f3ba2f] hover:text-black transition disabled:opacity-60" disabled={!wallet || loadingVerify}>
                    {loadingVerify ? 'Verifying…' : 'Verify Wallet'}
                  </button>
                </div>
              </div>

              {/* Role selection */}
              <div className="mt-8">
                <div className="text-sm text-gray-400 mb-2">Choose Role</div>
                <div className="flex flex-wrap gap-2">
                  {['institute','student','verifier'].map(r => (
                    <button key={r} onClick={()=>setRole(r)} className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${role===r ? 'bg-[#f3ba2f] text-black border-[#f3ba2f]' : 'border-gray-700 text-gray-300 hover:border-[#f3ba2f] hover:text-[#f3ba2f]'}`}>
                      {r.charAt(0).toUpperCase()+r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Register */}
              <div className="mt-6">
                <input className="w-full p-3 rounded bg-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f]" placeholder="Name (optional)" value={name} onChange={(e)=>setName(e.target.value)} />
                <div className="mt-4 flex justify-end">
                  <button onClick={register} className="px-5 py-2 rounded font-semibold bg-[#f3ba2f] text-black hover:brightness-95 transition disabled:opacity-60" disabled={loadingRegister || !wallet}>
                    {loadingRegister ? 'Saving…' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Highlights */}
          <div className="w-full md:max-w-sm">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-[#f3ba2f]">Why ChainCred</h3>
              <ul className="mt-4 space-y-3 text-gray-300">
                <li>🛡️ Tamper-proof credentials (opBNB)</li>
                <li>🗄️ Decentralized storage (Greenfield)</li>
                <li>⚡ Instant verification, low fees</li>
                <li>🔒 Soulbound, non-transferable</li>
              </ul>
              <div className="mt-6 text-sm text-gray-400">Need help? Visit Verify to test a certificate ID.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


