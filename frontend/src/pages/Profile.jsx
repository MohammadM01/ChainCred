import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import axios from '../utils/api';

export default function Profile(){
  const { user } = useUser();
  const [items, setItems] = useState([]);

  useEffect(()=>{
    async function load(){
      if(!user) return;
      try{
        const q = user.role === 'institute' ? `issuerWallet=${user.wallet}` : `studentWallet=${user.wallet}`;
        const res = await axios.get(`/api/verify?${q}`);
        setItems(res.data.data?.items || res.data.data || []);
      }catch{
        setItems([]);
      }
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">
        <h2 className="text-2xl">Profile</h2>
        {user ? (
          <div className="mt-4 bg-gray-900 p-4 rounded">
            <div>Address: {user.wallet}</div>
            <div>Role: {user.role}</div>
          </div>
        ) : (
          <div className="mt-4">Not logged in</div>
        )}

        <div className="mt-6 bg-gray-900 p-6 rounded">
          <h3 className="text-xl font-semibold">{user?.role === 'institute' ? 'Issued Certificates' : 'My Certificates'}</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {items?.length ? items.map((it, idx)=> (
              <div key={idx} className="border border-gray-800 rounded p-4">
                <div className="font-mono text-yellow-400">{it?.metadata?.certificateID || it?.certificateID}</div>
                <div className="text-sm text-gray-300 mt-1">Student: {it?.metadata?.studentWallet}</div>
                <div className="text-sm text-gray-300">Issuer: {it?.metadata?.issuerWallet}</div>
                <div className="text-sm text-gray-300">Date: {it?.metadata?.issuedDateISO}</div>
                <div className="mt-2 flex gap-3 text-sm">
                  {it?.metadata?.fileUrl && <a className="text-yellow-400" href={it.metadata.fileUrl} target="_blank" rel="noreferrer">PDF</a>}
                  {it?.metadata && <a className="text-yellow-400" href={`data:application/json,${encodeURIComponent(JSON.stringify(it.metadata))}`} target="_blank" rel="noreferrer">Metadata</a>}
                  {it?.metadata?.txHash && <a className="text-yellow-400" href={`https://explorer.testnet.opbnb.io/tx/${it.metadata.txHash}`} target="_blank" rel="noreferrer">Tx</a>}
                </div>
              </div>
            )) : <div>No items yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
