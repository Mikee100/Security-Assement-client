import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Security Awareness Quiz
          </Link>
          {/* Hamburger menu button for mobile */}
          <button
            className="md:hidden flex items-center px-3 py-2 border rounded text-white border-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
                <Link to="/user-quiz" className="hover:text-blue-200">
                  Take Quiz
                </Link>
                <Link to="/leaderboard" className="hover:text-blue-200">
                  Leaderboard
                </Link>
                <div className="flex items-center space-x-2">
                  <span>Welcome, {user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-2 mt-2 bg-blue-700 rounded shadow p-4 animate-fade-in">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/user-quiz" className="hover:text-blue-200" onClick={() => setMenuOpen(false)}>
                  Take Quiz
                </Link>
                <Link to="/leaderboard" className="hover:text-blue-200" onClick={() => setMenuOpen(false)}>
                  Leaderboard
                </Link>
                <div className="flex items-center space-x-2">
                  <span>Welcome, {user.username}</span>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 