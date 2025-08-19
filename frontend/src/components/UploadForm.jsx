import { useState } from 'react';
import axios from '../utils/api';

export default function UploadForm({ issuerWallet, onUploaded }){
  const [studentWallet, setStudentWallet] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(!file || !studentWallet) return;
    setLoading(true);
    try{
      const fd = new FormData();
      fd.append('file', file);
      fd.append('studentWallet', studentWallet);
      const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded && onUploaded({ ...(res.data.data || res.data), studentWallet, issuerWallet });
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="file" accept="application/pdf" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
      <input className="p-2 bg-black border rounded w-full" placeholder="Student Wallet" value={studentWallet} onChange={(e)=> setStudentWallet(e.target.value)} />
      <div className="flex justify-end">
        <button className="px-3 py-1 bg-yellow-400 text-black rounded" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </div>
    </form>
  )
}
