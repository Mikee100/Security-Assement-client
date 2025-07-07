import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/create-question', label: 'Create Question', icon: '➕' },
  { to: '/admin/results', label: 'Quiz Results', icon: '📊' },
];

const AdminNavbar = () => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) return null;

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-700 to-indigo-800 text-white flex flex-col shadow-lg z-20">
      <div className="h-16 flex items-center justify-center border-b border-blue-900 text-2xl font-bold tracking-wide">
        <span>Admin Panel</span>
      </div>
      <nav className="flex-1 flex flex-col py-6 space-y-1 px-4">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-colors
              ${location.pathname === link.to
                ? 'bg-white bg-opacity-20 font-semibold shadow'
                : 'hover:bg-white hover:bg-opacity-10'}`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mb-6 px-4">
        <div className="mb-2 text-sm text-blue-100">Admin: {admin.username}</div>
        <button
          onClick={handleLogout}
          className="w-full bg-indigo-900 hover:bg-indigo-950 px-3 py-2 rounded text-sm font-semibold transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar; 