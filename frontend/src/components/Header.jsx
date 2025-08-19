import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Header() {
  const { user } = useUser();

  return (
    <header className="p-4 border-b border-gray-800 bg-black shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl text-yellow-400 tracking-wide flex items-center gap-2">
          {/* Binance logo or emoji for branding */}
          <span role="img" aria-label="BNB">🟡</span> ChainCred
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold"
          >
            Home
          </Link>
          <Link 
            to="/verify" 
            className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold"
          >
            Verify
          </Link>
          <Link 
            to="/dashboard" 
            className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold"
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold"
          >
            Profile
          </Link>
          {user && (
            <span className="flex items-center gap-2 ml-4 text-sm bg-yellow-400 text-black rounded-full px-3 py-1 shadow">
              <span role="img" aria-label="User">👤</span>
              <span className="font-semibold">{user.role}</span>
              {/* If you want to show wallet, add: <span className="hidden md:inline ml-2">{user.wallet.slice(0,6)}...{user.wallet.slice(-4)}</span> */}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
