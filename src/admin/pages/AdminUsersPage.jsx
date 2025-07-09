import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAdmin } from '../../contexts/AdminContext';
import logo from '../../assets/react.svg';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const { admin } = useAdmin();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(Array.isArray(res.data.users) ? res.data.users : []);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  ) : [];

  // Summary stats
  const totalUsers = filteredUsers.length;
  const totalAdmins = filteredUsers.filter(u => u.role === 'admin').length;
  const totalVerified = filteredUsers.filter(u => u.verified).length;
  const totalUnverified = totalUsers - totalVerified;

  // Convert logo to base64 for PDF
  const getLogoBase64 = async () => {
    const response = await fetch(logo);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Username', 'Email', 'Role', 'Created At', 'Verified'];
    const rows = filteredUsers.map(user => [
      user.id,
      user.username,
      user.email,
      user.role,
      new Date(user.created_at).toLocaleString(),
      user.verified ? 'Yes' : 'No',
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' +
      headers.join(',') + '\n' +
      rows.map(e => e.map(v => `"${v}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `user_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    // Remove logo from PDF export
    // Header
    doc.setFontSize(22);
    doc.text('User Report', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 10, 10, { align: 'right' });
    doc.text(`Admin: ${admin?.username || 'N/A'}`, pageWidth - 10, 18, { align: 'right' });
    // Summary stats
    doc.setFontSize(11);
    doc.text(`Total Users: ${totalUsers}`, 10, 36);
    doc.text(`Admins: ${totalAdmins}`, 50, 36);
    doc.text(`Verified: ${totalVerified}`, 90, 36);
    doc.text(`Unverified: ${totalUnverified}`, 140, 36);
    // Table
    doc.autoTable({
      startY: 42,
      head: [['ID', 'Username', 'Email', 'Role', 'Created At', 'Verified']],
      body: filteredUsers.map(user => [
        user.id,
        user.username,
        user.email,
        user.role.charAt(0).toUpperCase() + user.role.slice(1),
        new Date(user.created_at).toLocaleString(),
        user.verified ? 'Yes' : 'No',
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [49, 130, 206], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [237, 242, 247] },
      margin: { left: 10, right: 10 },
      theme: 'striped',
    });
    // Footer
    doc.setFontSize(10);
    doc.text(`Security Awareness Admin Panel`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    doc.save(`user_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (loading) return <div className="ml-64 p-8 text-lg text-gray-600">Loading users...</div>;
  if (error) return <div className="ml-64 p-8 text-lg text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 ml-64 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Logo" className="h-12 w-12 rounded-full shadow" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">All Users</h2>
            <div className="text-gray-500 text-sm mt-1">Admin: <span className="font-semibold text-blue-700">{admin?.username || 'N/A'}</span></div>
          </div>
        </div>
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-700">{totalUsers}</div>
            <div className="text-gray-600 text-sm mt-1">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-indigo-700">{totalAdmins}</div>
            <div className="text-gray-600 text-sm mt-1">Admins</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">{totalVerified}</div>
            <div className="text-gray-600 text-sm mt-1">Verified</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-600">{totalUnverified}</div>
            <div className="text-gray-600 text-sm mt-1">Unverified</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by username, email, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800"
          />
          <div className="flex gap-2 mt-2 md:mt-0">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">Export CSV</button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition-colors">Export PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Username</th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">Role</th>
                <th className="py-3 px-4 text-left font-semibold">Created At</th>
                <th className="py-3 px-4 text-left font-semibold">Verified</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-4 text-center text-gray-500 text-lg">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 text-gray-700">{user.id}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{user.username}</td>
                    <td className="py-3 px-4 text-blue-700">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{new Date(user.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {user.verified ? (
                        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Yes</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage; 