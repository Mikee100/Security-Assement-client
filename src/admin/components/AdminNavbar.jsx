import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/create-question', label: 'Create Question', icon: '➕' },
  { to: '/admin/questions', label: 'Questions', icon: '❓' },
  { to: '/admin/results', label: 'Quiz Results', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

const AdminNavbar = () => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) return null;

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-700 to-indigo-800 text-white flex flex-col shadow-lg z-30 transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Top Bar: Admin Panel Name and Collapse Button */}
      <div className="h-16 flex items-center justify-between border-b border-blue-900 px-4">
        <span className="text-2xl font-bold tracking-wide">
          {!collapsed ? 'Admin Panel' : 'A'}
        </span>
        <button
          className="text-blue-200 hover:text-white focus:outline-none ml-2"
          title={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <span>&#9654;</span> : <span>&#9664;</span>}
        </button>
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col py-6 space-y-1 px-2">
        {navLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-150 cursor-pointer relative
                ${isActive
                  ? 'bg-blue-900 bg-opacity-80 font-bold text-white shadow'
                  : 'hover:bg-blue-900 hover:bg-opacity-60 hover:text-white'}
                ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? link.label : undefined}
            >
              <span className="text-xl" aria-label={link.label}>{link.icon}</span>
              {!collapsed && <span className="transition-opacity duration-200">{link.label}</span>}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {/* Divider */}
      <div className="border-t border-blue-900 mx-4 my-2" />
      {/* Admin Info and Logout */}
      <div className="mb-6 px-2">
        {!collapsed && <div className="mb-2 text-sm text-blue-100 truncate">Admin: {admin.username}</div>}
        <button
          onClick={handleLogout}
          className="w-full bg-indigo-900 hover:bg-indigo-950 px-3 py-2 rounded text-sm font-semibold transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar; 