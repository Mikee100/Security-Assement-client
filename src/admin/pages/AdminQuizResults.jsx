import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAdmin } from '../../contexts/AdminContext';

const AdminQuizResults = () => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const { admin } = useAdmin();

  useEffect(() => {
    axios.get('/api/admin/results').then(res => {
      setResults(res.data.results);
      setStats(res.data.stats);
    });
  }, []);

  const formatScore = (score) => {
    return typeof score === 'number' && !isNaN(score) ? score.toFixed(2) : 0;
  };

  const handleExportCSV = () => {
    const headers = ['User', 'Score', 'Total', 'Level', 'Completed At'];
    const rows = results.map(r => [
      r.username,
      r.score,
      r.total_questions,
      r.level || '-',
      r.completed_at ? new Date(r.completed_at).toLocaleString() : '-',
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' +
      headers.join(',') + '\n' +
      rows.map(e => e.map(v => `"${v}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quiz_results_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    // Header
    doc.setFontSize(22);
    doc.text('Quiz Results Report', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 10, 10, { align: 'right' });
    doc.text(`Admin: ${admin?.username || 'N/A'}`, pageWidth - 10, 18, { align: 'right' });
    // Summary stats
    if (stats) {
      doc.setFontSize(11);
      doc.text(`Total Attempts: ${stats.total_attempts}`, 10, 36);
      doc.text(`Avg Score: ${formatScore(stats.avg_score)}`, 60, 36);
      doc.text(`Best Score: ${stats.best_score}`, 110, 36);
      doc.text(`Lowest Score: ${stats.worst_score}`, 160, 36);
    }
    // Table
    doc.autoTable({
      startY: 42,
      head: [['User', 'Score', 'Total', 'Level', 'Completed At']],
      body: results.map(r => [
        r.username,
        r.score,
        r.total_questions,
        r.level || '-',
        r.completed_at ? new Date(r.completed_at).toLocaleString() : '-',
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
    doc.save(`quiz_results_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 ml-64 pl-5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">Quiz Results</h2>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">Export CSV</button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition-colors">Export PDF</button>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Total Attempts</span>
              <span className="text-2xl font-bold text-blue-700">{stats.total_attempts}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Average Score</span>
              <span className="text-2xl font-bold text-blue-700">{formatScore(stats.avg_score)}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Best Score</span>
              <span className="text-2xl font-bold text-blue-700">{stats.best_score}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Lowest Score</span>
              <span className="text-2xl font-bold text-blue-700">{stats.worst_score}</span>
            </div>
          </div>
        )}
        {stats && stats.per_level && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Attempts by Level</h3>
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden mb-4">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Attempts</th>
                  <th className="px-4 py-2">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.per_level.map((lvl, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    <td className="border px-4 py-2">{lvl.level || '-'}</td>
                    <td className="border px-4 py-2">{lvl.attempts}</td>
                    <td className="border px-4 py-2">{formatScore(lvl.avg_score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Completed At</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="hover:bg-blue-50">
                <td className="border px-4 py-2">{r.username}</td>
                <td className="border px-4 py-2">{r.score}</td>
                <td className="border px-4 py-2">{r.total_questions}</td>
                <td className="border px-4 py-2">{r.level || '-'}</td>
                <td className="border px-4 py-2">{r.completed_at ? new Date(r.completed_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminQuizResults;
