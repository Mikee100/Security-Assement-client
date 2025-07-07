import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminQuizResults = () => {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/admin/results').then(res => {
      setResults(res.data.results);
      setStats(res.data.stats);
    });
  }, []);

  const formatScore = (score) => {
    return typeof score === 'number' && !isNaN(score) ? score.toFixed(2) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 ml-64 pl-5 p-6">
      <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
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
  );
};

export default AdminQuizResults;
