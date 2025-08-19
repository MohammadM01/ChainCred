import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  function showToast(type, message) {
    const id = Date.now();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-white ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </UserContext.Provider>
  );
}

export function useUser(){
  return useContext(UserContext);
}

export default UserContext;
