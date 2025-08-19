import React from 'react';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';

export default function Profile(){
  const { user } = useUser();
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">
        <h2 className="text-2xl">Profile</h2>
        {user ? (
          <div className="mt-4 bg-gray-900 p-4 rounded">Address: {user.wallet} — Role: {user.role}</div>
        ) : (
          <div className="mt-4">Not logged in</div>
        )}
      </div>
    </div>
  )
}
