import React, { useEffect, useState, useRef } from 'react';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    if (hasVerified.current) return;
    hasVerified.current = true;
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="text-blue-600 text-2xl font-bold mb-2">Verifying...</div>
            <div className="text-gray-600">Please wait while we verify your email.</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-2xl font-bold mb-2">Success!</div>
            <div className="text-gray-700 mb-4">{message}</div>
            <a href="/login" className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go to Login</a>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-2xl font-bold mb-2">Verification Failed</div>
            <div className="text-gray-700 mb-4">{message}</div>
            <a href="/register" className="inline-block mt-2 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">Register Again</a>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 