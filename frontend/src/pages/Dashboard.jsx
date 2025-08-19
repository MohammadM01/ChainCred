import React from 'react';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';

export default function Dashboard(){
  const { user } = useUser();

  if(!user) return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">Please login to access dashboard (Go to /auth)</div>
    </div>
  );

  if(user.role === 'institute'){
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">Institute Dashboard (Upload / Mint) - integrate with /api/upload and /api/mint</div>
      </div>
    )
  }

  if(user.role === 'student'){
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">Student Dashboard (My Credentials)</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">Verifier Panel</div>
    </div>
  )
}
