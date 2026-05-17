import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf size={28} className="text-primary" />
            <span className="text-lg font-bold text-gray-800">Local Produce</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors font-medium">Browse</Link>
            {user && (
              <Link to="/my-garden" className="text-gray-600 hover:text-primary transition-colors font-medium">My Garden</Link>
            )}
            <Link to="/seasonal" className="text-gray-600 hover:text-primary transition-colors font-medium">Seasonal</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-light rounded-full px-3 py-1.5 hover:bg-green-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link to={`/profile/${user.id}`} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/my-garden" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={16} /> My Garden
                      </Link>
                      <Link to="/my-requests" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={16} /> My Requests
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-600 font-medium">Browse</Link>
          {user && <Link to="/my-garden" onClick={() => setMenuOpen(false)} className="block text-gray-600 font-medium">My Garden</Link>}
          <Link to="/seasonal" onClick={() => setMenuOpen(false)} className="block text-gray-600 font-medium">Seasonal</Link>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className="block text-gray-600">Profile</Link>
              <Link to="/my-requests" onClick={() => setMenuOpen(false)} className="block text-gray-600">My Requests</Link>
              <button onClick={handleLogout} className="block text-red-600 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-600">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-primary font-medium">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
