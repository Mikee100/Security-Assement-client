import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCreateQuestion = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [levels, setLevels] = useState([]);
  const [levelId, setLevelId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/admin/levels').then(res => {
      setLevels(res.data.levels);
    });
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/admin/questions',
        {
          question,
          options,
          correct_answer: correctAnswer,
          category,
          level_id: levelId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Question created successfully!');
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setCategory('');
      setLevelId('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating question');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Quiz Question</h2>
      <div className="mb-2">
        <label>Question:</label>
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full border p-2" required />
      </div>
      {options.map((opt, idx) => (
        <div className="mb-2" key={idx}>
          <label>Option {idx + 1}:</label>
          <input type="text" value={opt} onChange={e => handleOptionChange(idx, e.target.value)} className="w-full border p-2" required />
        </div>
      ))}
      <div className="mb-2">
        <label>Correct Answer:</label>
        <input type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="w-full border p-2" required />
      </div>
      <div className="mb-2">
        <label>Category:</label>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2" />
      </div>
      <div className="mb-2">
        <label>Level:</label>
        <select value={levelId} onChange={e => setLevelId(e.target.value)} className="w-full border p-2" required>
          <option value="">Select level</option>
          {levels.map(level => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Question</button>
      {message && <div className="mt-2 text-green-600">{message}</div>}
    </form>
  );
};

export default AdminCreateQuestion; 