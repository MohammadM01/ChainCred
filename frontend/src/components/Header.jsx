import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="p-4 border-b border-gray-800 bg-black shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl text-[#f3ba2f] tracking-wide flex items-center gap-2">
          <span role="img" aria-label="BNB">🟡</span> ChainCred
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-[#f3ba2f] transition-colors font-semibold"
          >
            Home
          </Link>
          <Link 
            to="/verify" 
            className="text-gray-300 hover:text-[#f3ba2f] transition-colors font-semibold"
          >
            Verify
          </Link>
          <Link 
            to="/dashboard-binance" 
            className="text-gray-300 hover:text-[#f3ba2f] transition-colors font-semibold"
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className="text-gray-300 hover:text-[#f3ba2f] transition-colors font-semibold"
          >
            Profile
          </Link>
          {user && user.role === 'student' && ( // NEW: Conditional for student only
            <Link 
              to="/resume-builder" 
              className="text-gray-300 hover:text-[#f3ba2f] transition-colors font-semibold"
            >
              Resume
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm bg-[#f3ba2f] text-black rounded-full px-3 py-1 shadow hover:shadow-yellow-400/50 transition-shadow">
                <span role="img" aria-label="User">👤</span>
                <span className="font-semibold">{user.role}</span>
                <span className="hidden md:inline ml-2">{user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}</span>
              </span>
              <button
                onClick={() => {
                  console.log('Logout button clicked');
                  logout();
                }}
                className="px-4 py-1 rounded-lg font-semibold border-2 border-[#f3ba2f] text-[#f3ba2f] hover:bg-[#f3ba2f] hover:text-black transition-transform transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
