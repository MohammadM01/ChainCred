import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Header(){
  const { user } = useUser();
  return (
    <header className="p-4 border-b border-gray-800">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl text-yellow-400">ChainCred</Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-gray-300">Home</Link>
          <Link to="/verify" className="text-gray-300">Verify</Link>
          <Link to="/dashboard" className="text-gray-300">Dashboard</Link>
          <Link to="/profile" className="text-gray-300">Profile</Link>
          {user && <span className="ml-2 text-sm px-2 py-1 bg-yellow-400 text-black rounded">{user.role}</span>}
        </nav>
      </div>
    </header>
  )
}
