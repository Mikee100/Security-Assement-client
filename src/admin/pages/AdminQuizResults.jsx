import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAdmin } from '../../contexts/AdminContext';
import { FiDownload, FiBarChart2, FiAward, FiTrendingUp, FiTrendingDown, FiUsers, FiClock } from 'react-icons/fi';

const AdminQuizResults = () => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'completed_at', direction: 'desc' });
  const { admin } = useAdmin();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/admin/results');
        setResults(res.data.results);
        setStats(res.data.stats);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatScore = (score) => {
    return typeof score === 'number' && !isNaN(score) ? score.toFixed(2) : '0.00';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleExportCSV = () => {
    const headers = ['User', 'Score', 'Total', 'Level', 'Completed At'];
    const rows = filteredResults.map(r => [
      r.username,
      r.score,
      r.total_questions,
      r.level || '-',
      r.completed_at ? formatDate(r.completed_at) : '-',
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' +
      headers.join(',') + '\n' +
      rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quiz_results_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(49, 130, 206);
    doc.text('Quiz Results Report', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 10, 10, { align: 'right' });
    doc.text(`Admin: ${admin?.username || 'N/A'}`, pageWidth - 10, 16, { align: 'right' });
    
    // Summary stats
    if (stats) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Attempts: ${stats.total_attempts}`, 10, 36);
      doc.text(`Avg Score: ${formatScore(stats.avg_score)}`, 60, 36);
      doc.text(`Best Score: ${stats.best_score}`, 110, 36);
      doc.text(`Lowest Score: ${stats.worst_score}`, 160, 36);
    }
    
    // Table
    doc.autoTable({
      startY: 42,
      head: [['User', 'Score', 'Total', 'Level', 'Completed At']],
      body: filteredResults.map(r => [
        r.username,
        r.score,
        r.total_questions,
        r.level || '-',
        r.completed_at ? formatDate(r.completed_at) : '-',
      ]),
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [49, 130, 206], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 10, right: 10 },
      theme: 'grid',
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Security Awareness Admin Panel - Confidential`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    doc.save(`quiz_results_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = React.useMemo(() => {
    let sortableResults = [...results];
    if (sortConfig.key) {
      sortableResults.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableResults;
  }, [results, sortConfig]);

  const filteredResults = sortedResults.filter(result =>
    result.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (result.level && result.level.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 ml-64 pl-5">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quiz Results Dashboard</h1>
            <p className="text-gray-600">View and analyze user quiz performance</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={handleExportCSV} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-sm"
            >
              <FiDownload size={16} />
              Export CSV
            </button>
            <button 
              onClick={handleExportPDF} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiDownload size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiUsers size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Attempts</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.total_attempts}</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FiBarChart2 size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Average Score</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{formatScore(stats.avg_score)}%</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <FiTrendingUp size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Best Score</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.best_score}%</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <FiTrendingDown size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Lowest Score</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.worst_score}%</span>
            </div>
          </div>
        )}

        {/* Level Breakdown */}
        {stats && stats.per_level && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiAward className="text-blue-600" />
              Attempts by Difficulty Level
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.per_level.filter(lvl => lvl.level).map((lvl, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          !lvl.level ? 'bg-gray-100 text-gray-800' :
                          lvl.level.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                          lvl.level.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lvl.level || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{lvl.attempts}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-900">{formatScore(lvl.avg_score)}%</span>
                          <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-600" 
                              style={{ width: `${Math.min(100, lvl.avg_score)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">All Quiz Attempts</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users or levels..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('username')}
                    >
                      <div className="flex items-center">
                        User
                        <SortIndicator columnKey="username" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        Score
                        <SortIndicator columnKey="score" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('level')}
                    >
                      <div className="flex items-center">
                        Level
                        <SortIndicator columnKey="level" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('completed_at')}
                    >
                      <div className="flex items-center">
                        <FiClock className="mr-1" />
                        Completed At
                        <SortIndicator columnKey="completed_at" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                              {result.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{result.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{result.score}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full" 
                              style={{ 
                                width: `${result.score}%`,
                                backgroundColor: result.score >= 70 ? '#10B981' : result.score >= 40 ? '#F59E0B' : '#EF4444'
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.total_questions}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            !result.level ? 'bg-gray-100 text-gray-800' :
                            result.level.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                            result.level.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.level || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(result.completed_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No results found {searchTerm && `for "${searchTerm}"`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizResults;