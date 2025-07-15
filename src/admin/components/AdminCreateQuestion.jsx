import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

const AdminCreateQuestion = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [levels, setLevels] = useState([]);
  const [levelId, setLevelId] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await axios.get('/api/admin/levels');
        setLevels(res.data.levels);
      } catch (err) {
        setMessage({ text: 'Failed to load difficulty levels', type: 'error' });
      }
    };
    fetchLevels();
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer === options[index]) {
        setCorrectAnswer('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!question.trim() || options.some(opt => !opt.trim()) || !correctAnswer.trim()) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    if (!options.includes(correctAnswer)) {
      setMessage({ text: 'Correct answer must match one of the options', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/admin/questions',
        {
          question: question.trim(),
          options: options.map(opt => opt.trim()).filter(opt => opt),
          correct_answer: correctAnswer.trim(),
          category: category.trim(),
          level_id: levelId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ text: 'Question created successfully!', type: 'success' });
      // Reset form
      setQuestion('');
      setOptions(['', '', '']);
      setCorrectAnswer('');
      setCategory('');
      setLevelId('');
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || 'Error creating question', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
              <p className="mt-1 text-sm text-gray-600">
                Fill out the form below to add a new question to the quiz
              </p>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'}`}>
                <div className="flex items-center">
                  {message.type === 'success' 
                    ? <FiCheck className="mr-2" /> 
                    : <FiAlertCircle className="mr-2" />}
                  {message.text}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Field */}
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="question"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter the question text..."
                  required
                />
              </div>

              {/* Options Fields */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">{options.length}/6 options</span>
                </div>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                          aria-label="Remove option"
                        >
                          <FiX size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FiPlus className="mr-1" />
                    Add another option
                  </button>
                )}
              </div>

              {/* Correct Answer */}
              <div>
                <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                  id="correctAnswer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  required
                  disabled={options.every(opt => !opt.trim())}
                >
                  <option value="">Select the correct answer</option>
                  {options.filter(opt => opt.trim()).map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt || `Option ${idx + 1}`}
                    </option>
                  ))}
                </select>
                {correctAnswer && !options.includes(correctAnswer) && (
                  <p className="mt-1 text-sm text-red-600">
                    Warning: The correct answer doesn't match any of the options
                  </p>
                )}
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Security, Privacy"
                  />
                </div>
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="level"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    required
                    disabled={levels.length === 0}
                  >
                    <option value="">Select difficulty level</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  {levels.length === 0 && (
                    <p className="mt-1 text-sm text-yellow-600">
                      Loading difficulty levels...
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateQuestion;