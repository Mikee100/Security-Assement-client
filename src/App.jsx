import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import Navbar from './components/Navbar';
import AdminNavbar from './admin/components/AdminNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminCreateQuestionPage from './admin/pages/AdminCreateQuestionPage';
import UserQuiz from './pages/UserQuiz';
import AdaptiveQuiz from './pages/AdaptiveQuiz';
import './App.css';
import AdminQuizResults from './admin/pages/AdminQuizResults';
import VerifyEmail from './pages/VerifyEmail';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import AdminQuestionsPage from './admin/pages/AdminQuestionsPage';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <div className="App">
            {/* User Routes */}
            <Routes>
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                </>
              } />
              <Route path="/login" element={
                <>
                  <Navbar />
                  <Login />
                </>
              } />
              <Route path="/register" element={
                <>
                  <Navbar />
                  <Register />
                </>
              } />
              <Route path="/leaderboard" element={
                <>
                  <Navbar />
                  <Leaderboard />
                </>
              } />
              <Route path="/user-quiz" element={
                <>
                  <Navbar />
                  <UserQuiz />
                </>
              } />
              <Route path="/adaptive-quiz" element={
                <>
                  <Navbar />
                  <AdaptiveQuiz />
                </>
              } />
              <Route path="/verify-email" element={
                <>
                  <Navbar />
                  <VerifyEmail />
                </>
              } />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <>
                  <Navbar />
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </>
              } />
              <Route path="/quiz" element={
                <>
                  <Navbar />
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                </>
              } />
              <Route path="/results" element={
                <>
                  <Navbar />
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                </>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <>
                  <AdminNavbar />
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                </>
              } />
              <Route path="/admin/create-question" element={
                <>
                  <AdminNavbar />
                  <ProtectedAdminRoute>
                    <AdminCreateQuestionPage />
                  </ProtectedAdminRoute>
                </>
              } />
              <Route path="/admin/results" element={
                <>
                  <AdminNavbar />
                  <ProtectedAdminRoute>
                    <AdminQuizResults />
                  </ProtectedAdminRoute>
                </>
              } />
              <Route path="/admin/users" element={
                <>
                  <AdminNavbar />
                  <ProtectedAdminRoute>
                    <AdminUsersPage />
                  </ProtectedAdminRoute>
                </>
              } />
              <Route path="/admin/questions" element={
                <>
                  <AdminNavbar />
                  <ProtectedAdminRoute>
                    <AdminQuestionsPage />
                  </ProtectedAdminRoute>
                </>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
