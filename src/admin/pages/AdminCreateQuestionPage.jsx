import React, { useState } from 'react';
import AdminCreateQuestion from '../components/AdminCreateQuestion';
import axios from 'axios';

const AdminCreateQuestionPage = () => {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateQuestion = async ({ question, answer, options }) => {
    setMessage(null);
    setError(null);
    try {
      // Adjust the API endpoint as needed
      await axios.post('/api/admin/questions', {
        question,
        answer,
        options,
      });
      setMessage('Question created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create question.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-start py-10 ml-64 pl-5">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Create a New Quiz Question</h1>
        {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
        <AdminCreateQuestion onCreate={handleCreateQuestion} />
      </div>
    </div>
  );
};

export default AdminCreateQuestionPage; 