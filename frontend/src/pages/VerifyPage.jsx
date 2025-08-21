import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from '../utils/api';
import { useSearchParams } from 'react-router-dom';

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
        const res = await axios.get(`${q.includes('0x') ? `/api/verify?studentWallet=${q}` : `/api/verify?certificateID=${q}`}`);
      setResult(res.data.data || res.data);
    }catch(err){
      setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
    }finally{setLoading(false)}
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
          const res = await axios.get(`${param.includes('0x') ? `/api/verify?studentWallet=${param}` : `/api/verify?certificateID=${param}`}`);
          setResult(res.data.data || res.data);
        }catch(err){
          setResult({ valid: false, error: err?.response?.data?.error || 'Not found' });
        }finally{ setLoading(false) }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6">
      <Header />
      <section className="max-w-3xl mx-auto py-12">
        <h2 className="text-2xl">Verify Credential</h2>
        <form className="mt-4 bg-gray-900 p-6 rounded" onSubmit={submit}>
          <input className="w-full p-2 bg-black border" placeholder="Certificate ID or Wallet" value={q} onChange={e=>setQ(e.target.value)} />
          <div className="mt-3 flex justify-end">
            <button className="px-3 py-1 bg-yellow-400 text-black rounded" disabled={loading}>{loading ? 'Checking...' : 'Search'}</button>
          </div>
        </form>

        <div className="mt-6">
          {result && (
            result.valid ? (
              <div className="bg-gray-900 p-4 rounded">
                <div>✅ Valid</div>
                <div>Student: {result.metadata?.studentWallet}</div>
                <div>Issuer: {result.metadata?.issuerWallet}</div>
                <div>Issued: {result.metadata?.issuedDateISO}</div>
                <div>CertificateID: {result.metadata?.certificateID}</div>
                <a className="text-yellow-400" href={result.metadata?.fileUrl} target="_blank" rel="noreferrer">Open PDF</a>
                <div>Tx: <a className="text-yellow-400" href={`https://opbnb-testnet.bscscan.com/tx/${result.metadata?.txHash}`} target="_blank" rel="noreferrer">View on opBNB</a></div>
              </div>
            ) : (
              <div className="bg-red-900 p-4 rounded">❌ Credential not found / invalid — {result.error}</div>
            )
          )}
        </div>
      </section>
    </div>
  )
}
