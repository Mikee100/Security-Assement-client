import React from 'react';
import AdminCreateQuestion from '../components/AdminCreateQuestion';

const AdminCreateQuestionPage = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col justify-start py-10 ml-64 pl-5">
    <div className="max-w-5xl w-full mx-auto bg-white rounded-xl shadow p-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Quiz Question</h1>
      <AdminCreateQuestion />
    </div>
  </div>
);

export default AdminCreateQuestionPage; 