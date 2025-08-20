import React, { useState } from 'react';
import { useUser } from '../context/UserContext'; // UPDATED: Import the custom hook
import ProfileForm from '../components/ProfileForm';
import UploadCertificate from '../components/UploadCertificate';
import ResumePreview from '../components/ResumePreview';

const ResumeBuilder = () => {
  const { user, showToast } = useUser(); // UPDATED: Use the hook
  const [profileSaved, setProfileSaved] = useState(false);

  if (!user?.wallet) {
    showToast('error', 'Please log in with wallet.');
    return <p className="text-white">Please log in.</p>;
  }
  if (user.role !== 'student') {
    showToast('error', 'This feature is only for students.');
    return <p className="text-white">Access denied: Students only.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Build Your ChainCred Resume</h1>
      <ProfileForm wallet={user.wallet} onSave={() => setProfileSaved(true)} />
      {profileSaved && <UploadCertificate wallet={user.wallet} />}
      {profileSaved && <ResumePreview wallet={user.wallet} />}
    </div>
  );
};

export default ResumeBuilder;
