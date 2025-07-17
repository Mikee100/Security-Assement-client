import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUsers, FiList, FiBarChart2, FiPlus, FiLogOut, FiHome } from 'react-icons/fi';
import logo from '../../assets/react.svg'; // Replace with your logo if available

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { to: '/admin/questions', label: 'Questions', icon: <FiList /> },
  { to: '/admin/results', label: 'Results', icon: <FiBarChart2 /> },
  { to: '/admin/create-question', label: 'Create Question', icon: <FiPlus /> },
];

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-800 to-blue-500 text-white flex flex-col shadow-lg z-30">
      {/* Logo and Title */}
      <div className="flex items-center h-20 px-6 border-b border-blue-700 gap-3">
        <img src={logo} alt="Logo" className="h-10 w-10 rounded bg-white p-1 shadow" />
        <span className="text-2xl font-bold tracking-wide">Admin Panel</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col py-6 space-y-1 px-2">
        {navLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 py-2 px-4 rounded-lg mb-1 transition-all duration-150 cursor-pointer font-medium
                ${isActive ? 'bg-white text-blue-800 shadow font-bold' : 'hover:bg-blue-600 hover:text-white text-white'}`}
              style={isActive ? { boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' } : {}}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* User and Logout */}
      <div className="mt-auto px-4 pb-6">
        {user && <div className="mb-2 text-sm text-blue-100 truncate">{user.fullName}</div>}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-semibold transition-colors"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar; 