import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';

export default function DashboardBinance(){
  const { user, showToast } = useUser();
  const role = useMemo(()=>user?.role, [user]);

  if(!user){
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16">Please login at <span className="text-[#f3ba2f]">/auth-binance</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-1 text-gray-400">Welcome, <span className="font-mono">{user.wallet}</span> • Role: <span className="text-[#f3ba2f] font-semibold">{user.role}</span></div>

        {role === 'institute' && <InstitutePanel user={user} showToast={showToast} />}
        {role === 'student' && <StudentPanel user={user} />}
        {role !== 'institute' && role !== 'student' && <VerifierPanel />}
      </main>
      <Footer />
    </div>
  );
}

function InstitutePanel({ user, showToast }){
  const [file, setFile] = useState(null);
  const [studentWallet, setStudentWallet] = useState('');
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [issued, setIssued] = useState([]);

  async function loadIssued(){
    try{
      const res = await axios.get(`/api/verify?issuerWallet=${user.wallet}`);
      setIssued(res.data?.data?.items || res.data?.data || []);
    }catch{ setIssued([]); }
  }

  useEffect(()=>{ loadIssued(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(e){
    e.preventDefault();
    if(!file || !studentWallet) return showToast('error', 'Select file and student wallet');
    setUploading(true);
    try{
      const fd = new FormData();
      fd.append('file', file);
      fd.append('studentWallet', studentWallet);
      fd.append('issuerWallet', user.wallet);
      const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setUploadResult(res.data?.data || res.data);
      showToast('success', 'Uploaded');
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Upload failed');
    }finally{ setUploading(false) }
  }

  async function handleMint(){
    if(!uploadResult?.metadataUrl) return showToast('error', 'Upload first');
    setMinting(true);
    try{
      const res = await axios.post('/api/mint', {
        studentWallet,
        metadataUrl: uploadResult.metadataUrl,
        issuerWallet: user.wallet,
      });
      setUploadResult(prev => ({ ...prev, txHash: res.data?.data?.txHash, tokenId: res.data?.data?.tokenId }));
      showToast('success', 'Minted');
      await loadIssued();
    }catch(err){
      showToast('error', err?.response?.data?.error || 'Mint failed');
    }finally{ setMinting(false) }
  }

  return (
    <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-[#f3ba2f]">Issue Credential</h3>
        <form className="mt-4 space-y-3" onSubmit={handleUpload}>
          <input type="file" accept="application/pdf" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="block text-sm" />
          <input className="w-full p-3 rounded bg-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f]" placeholder="Student Wallet (0x...)" value={studentWallet} onChange={(e)=>setStudentWallet(e.target.value)} />
          <div className="flex justify-end">
            <button className="px-5 py-2 rounded font-semibold bg-[#f3ba2f] text-black disabled:opacity-60" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload PDF'}</button>
          </div>
        </form>
        {uploadResult && (
          <div className="mt-4 text-sm text-gray-300 space-y-1">
            <div>metadataUrl: <a className="text-[#f3ba2f]" target="_blank" rel="noreferrer" href={uploadResult.metadataUrl}>open</a></div>
            <div>fileHash: {uploadResult.fileHash}</div>
            <div>certificateID: {uploadResult.certificateID}</div>
            <div className="flex gap-2 mt-2">
              <button onClick={handleMint} className="px-4 py-2 rounded border-2 border-[#f3ba2f] text-[#f3ba2f] hover:bg-[#f3ba2f] hover:text-black disabled:opacity-60" disabled={minting}>{minting ? 'Minting…' : 'Mint Credential'}</button>
            </div>
            {uploadResult.txHash && (
              <div className="mt-2">Tx: <a className="text-[#f3ba2f]" target="_blank" rel="noreferrer" href={`https://explorer.testnet.opbnb.io/tx/${uploadResult.txHash}`}>{uploadResult.txHash.slice(0,10)}…</a></div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-[#f3ba2f]">Issued</h3>
        <div className="mt-4 max-h-[420px] overflow-auto divide-y divide-gray-800">
          {issued?.length ? issued.map((it, idx)=> (
            <div key={idx} className="py-3 text-sm">
              <div className="font-mono text-[#f3ba2f]">{it?.metadata?.certificateID || it?.certificateID}</div>
              <div className="text-gray-400">Student: {it?.metadata?.studentWallet || it?.studentWallet}</div>
              <div className="text-gray-400">Date: {it?.metadata?.issuedDateISO || '-'}</div>
            </div>
          )) : <div className="text-gray-500">No items</div>}
        </div>
      </div>
    </section>
  );
}

function StudentPanel({ user }){
  const [items, setItems] = useState([]);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await axios.get(`/api/verify?studentWallet=${user.wallet}`);
        setItems(res.data?.data?.items || res.data?.data || []);
      }catch{ setItems([]); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-[#f3ba2f]">My Credentials</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.length ? items.map((it, idx)=> (
          <div key={idx} className="p-4 rounded border border-gray-800">
            <div className="font-mono text-[#f3ba2f]">{it?.metadata?.certificateID || it?.certificateID}</div>
            <div className="text-sm text-gray-400">Issuer: {it?.metadata?.issuerWallet}</div>
            <div className="text-sm text-gray-400">Date: {it?.metadata?.issuedDateISO}</div>
            <div className="mt-2 flex gap-3 text-sm">
              {it?.metadata?.fileUrl && <a className="text-[#f3ba2f]" href={it.metadata.fileUrl} target="_blank" rel="noreferrer">PDF</a>}
              {it?.metadata && <a className="text-[#f3ba2f]" href={`data:application/json,${encodeURIComponent(JSON.stringify(it.metadata))}`} target="_blank" rel="noreferrer">Metadata</a>}
              {it?.metadata?.txHash && <a className="text-[#f3ba2f]" href={`https://explorer.testnet.opbnb.io/tx/${it.metadata.txHash}`} target="_blank" rel="noreferrer">Tx</a>}
            </div>
          </div>
        )) : <div className="text-gray-500">No credentials</div>}
      </div>
    </section>
  );
}

function VerifierPanel(){
  const { showToast } = useUser();
  const [query, setQuery] = useState('');

  async function submit(e){
    e.preventDefault();
    if(!query) return;
    try{
      const res = await axios.get(`/api/verify?${query.includes('0x') ? `studentWallet=${query}` : `certificateID=${query}`}`);
      const data = res.data?.data || res.data;
      if(data?.valid){ showToast('success', 'Valid credential'); } else { showToast('error', 'Invalid'); }
    }catch{ showToast('error', 'Lookup failed'); }
  }

  return (
    <section className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-[#f3ba2f]">Verifier Panel</h3>
      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input className="w-full p-3 rounded bg-black border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f3ba2f]" placeholder="Certificate ID or Wallet" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <button className="px-5 py-2 rounded font-semibold bg-[#f3ba2f] text-black">Check</button>
      </form>
    </section>
  );
}


