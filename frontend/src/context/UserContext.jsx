// frontend/src/context/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    // auto remove toast after 3s (like toastify)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading, showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-xl shadow-lg text-white transition-all duration-300
              ${t.type === 'error' ? 'bg-red-600' : 
                t.type === 'warning' ? 'bg-yellow-600' : 
                t.type === 'info' ? 'bg-blue-600' : 
                'bg-green-600'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
