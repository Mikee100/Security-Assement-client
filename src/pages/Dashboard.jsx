import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quizAPI } from '../utils/api';
import { getCyberNews } from '../utils/api';

// Cybersecurity tips for carousel
const CYBER_TIPS = [
  "Use strong, unique passwords for every account.",
  "Enable two-factor authentication whenever possible.",
  "Be cautious of phishing emails and suspicious links.",
  "Keep your software and devices updated.",
  "Never share sensitive information over unsecured channels."
];

// Security checklist items
const SECURITY_CHECKLIST = [
  { id: 1, label: "Enabled Two-Factor Authentication", key: "2fa" },
  { id: 2, label: "Updated password in last 3 months", key: "password_update" },
  { id: 3, label: "Completed phishing awareness quiz", key: "phishing_quiz" },
  { id: 4, label: "Reviewed privacy settings", key: "privacy_settings" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [checklist, setChecklist] = useState({});
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [twofa, setTwofa] = useState({ enabled: false, loading: true });
  const [twofaSetup, setTwofaSetup] = useState(null); // { secret, qrCodeDataURL }
  const [twofaCode, setTwofaCode] = useState('');
  const [twofaMsg, setTwofaMsg] = useState('');
  const [twofaError, setTwofaError] = useState('');

  // Carousel effect for tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CYBER_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, attemptsResponse] = await Promise.all([
          quizAPI.getUserStats(),
          quizAPI.getUserAttempts()
        ]);
        setStats(statsResponse.data.stats);
        setRecentAttempts(attemptsResponse.data.attempts.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Fetch cybersecurity news
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      const articles = await getCyberNews();
      setNews(articles);
      setNewsLoading(false);
    };
    fetchNews();
  }, []);

  // Fetch 2FA status on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setTwofa({ enabled: data.user?.twofa_enabled, loading: false });
      } catch {
        setTwofa({ enabled: false, loading: false });
      }
    };
    fetchProfile();
  }, []);

  // Start 2FA setup
  const handleEnable2FA = async () => {
    setTwofaMsg(''); setTwofaError('');
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTwofaSetup(data);
    } catch {
      setTwofaError('Failed to start 2FA setup.');
    }
  };

  // Verify 2FA code
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwofaMsg(''); setTwofaError('');
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: twofaCode })
      });
      const data = await res.json();
      if (res.ok) {
        setTwofaMsg('2FA enabled successfully!');
        setTwofa({ enabled: true, loading: false });
        setTwofaSetup(null);
      } else {
        setTwofaError(data.error || 'Invalid code.');
      }
    } catch {
      setTwofaError('Failed to verify 2FA code.');
    }
  };

  // Handle checklist toggle
  const handleChecklistToggle = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // Helper for progress bar
  const ProgressBar = ({ value, max, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`h-3 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Cybersecurity Tips Carousel */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow flex-1">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <div>
                <p className="font-semibold text-blue-800">Cybersecurity Tip</p>
                <p className="text-blue-700 text-lg animate-fade-in">{CYBER_TIPS[tipIndex]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Progress Bars */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Attempts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_attempts || 0}</p>
                </div>
              </div>
              <ProgressBar value={stats.total_attempts || 0} max={20} color="bg-blue-400" />
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.average_score ? Math.round(stats.average_score) : 0}%</p>
                </div>
              </div>
              <ProgressBar value={stats.average_score || 0} max={100} color="bg-green-400" />
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Best Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.best_score || 0}%</p>
                </div>
              </div>
              <ProgressBar value={stats.best_score || 0} max={100} color="bg-yellow-400" />
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Time</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_time ? Math.round(stats.total_time / 60) : 0} min</p>
                </div>
              </div>
              <ProgressBar value={stats.total_time ? Math.round(stats.total_time / 60) : 0} max={120} color="bg-purple-400" />
            </div>
          </div>
        )}

        {/* Security Checklist */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Security Checklist
            </h3>
            <ul className="space-y-2">
              {SECURITY_CHECKLIST.map((item) => (
                <li key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!checklist[item.key]}
                    onChange={() => handleChecklistToggle(item.key)}
                    className="form-checkbox h-5 w-5 text-green-600 transition duration-150"
                  />
                  <span className={`ml-3 ${checklist[item.key] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/adaptive-quiz"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Take New Quiz
              </Link>
              <Link
                to="/leaderboard"
                className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-blue-50 transition cursor-pointer">
                    <div>
                      <p className="font-medium">Quiz Attempt</p>
                      <p className="text-sm text-gray-500">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{attempt.score}%</p>
                      <p className="text-sm text-gray-500">
                        {attempt.correct_answers}/{attempt.total_questions}
                      </p>
                      <button className="mt-1 text-xs text-blue-600 hover:underline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent attempts. Take your first quiz!</p>
            )}
          </div>
        </div>

        {/* Cybersecurity News Feed */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" />
              </svg>
              Latest Cybersecurity News
            </h3>
            {newsLoading ? (
              <div className="text-gray-500">Loading news...</div>
            ) : news.length > 0 ? (
              <ul className="space-y-3">
                {news.map((article, idx) => (
                  <li key={idx} className="border-b last:border-b-0 pb-2">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-medium flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-8 8a1 1 0 01-.293.207l-4 2a1 1 0 01-1.316-1.316l2-4a1 1 0 01.207-.293l8-8z"></path></svg>
                      {article.title}
                    </a>
                    <span className="block text-xs text-gray-400 ml-6">{article.source?.name || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No news available at the moment.</div>
            )}
          </div>
        </div>

        {/* 2FA Setup Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Two-Factor Authentication (2FA)
            </h3>
            {twofa.loading ? (
              <div className="text-gray-500">Loading 2FA status...</div>
            ) : twofa.enabled ? (
              <div className="text-green-600 font-semibold">2FA is enabled on your account.</div>
            ) : twofaSetup ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="flex flex-col items-center">
                  <img src={twofaSetup.qrCodeDataURL} alt="2FA QR Code" className="mb-2 w-40 h-40" />
                  <div className="text-xs text-gray-500 break-all">Secret: {twofaSetup.secret}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-digit code from your authenticator app:</label>
                  <input type="text" value={twofaCode} onChange={e => setTwofaCode(e.target.value)} maxLength={6} className="border rounded px-3 py-2 w-32 text-center" required />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Verify & Enable 2FA</button>
                {twofaMsg && <div className="text-green-600 mt-2">{twofaMsg}</div>}
                {twofaError && <div className="text-red-600 mt-2">{twofaError}</div>}
              </form>
            ) : (
              <div>
                <button onClick={handleEnable2FA} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Enable 2FA</button>
                {twofaMsg && <div className="text-green-600 mt-2">{twofaMsg}</div>}
                {twofaError && <div className="text-red-600 mt-2">{twofaError}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 