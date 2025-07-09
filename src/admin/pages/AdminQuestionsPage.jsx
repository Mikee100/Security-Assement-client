import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({ open: false, question: null });
  const [levels, setLevels] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/api/admin/questions');
        setQuestions(Array.isArray(res.data.questions) ? res.data.questions : []);
      } catch (err) {
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    axios.get('/api/admin/levels').then(res => setLevels(res.data.levels));
  }, []);

  // Get unique categories from questions
  const categories = Array.from(new Set(questions.map(q => q.category).filter(Boolean)));

  const filteredQuestions = Array.isArray(questions) ? questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(search.toLowerCase())) ||
      (q.level && q.level.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !categoryFilter || q.category === categoryFilter;
    const matchesLevel = !levelFilter || q.level === levelFilter || q.level_id === levelFilter;
    const createdAt = q.created_at ? new Date(q.created_at) : null;
    const matchesDateFrom = !dateFrom || (createdAt && createdAt >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (createdAt && createdAt <= new Date(dateTo + 'T23:59:59'));
    return matchesSearch && matchesCategory && matchesLevel && matchesDateFrom && matchesDateTo;
  }) : [];

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`/api/admin/questions/${id}`);
      setQuestions(qs => qs.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  const handleEdit = (q) => {
    setEditModal({ open: true, question: q });
  };

  const handleEditChange = (field, value) => {
    setEditModal(modal => ({ ...modal, question: { ...modal.question, [field]: value } }));
  };

  const handleEditOptionChange = (idx, value) => {
    setEditModal(modal => ({
      ...modal,
      question: {
        ...modal.question,
        options: Array.isArray(modal.question.options)
          ? modal.question.options.map((opt, i) => (i === idx ? value : opt))
          : (modal.question.options ? JSON.parse(modal.question.options).map((opt, i) => (i === idx ? value : opt)) : []).map((opt, i) => (i === idx ? value : opt)),
      },
    }));
  };

  const handleEditSave = async () => {
    const q = editModal.question;
    try {
      await axios.put(`/api/admin/questions/${q.id}`, {
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
        correct_answer: q.correct_answer,
        category: q.category,
        level_id: q.level_id || levels.find(l => l.name === q.level)?.id,
      });
      setQuestions(qs => qs.map(qq => qq.id === q.id ? { ...qq, ...q, level: levels.find(l => l.id === (q.level_id || levels.find(lv => lv.name === q.level)?.id))?.name } : qq));
      setEditModal({ open: false, question: null });
    } catch (err) {
      alert('Failed to update question');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Question', 'Options', 'Answer', 'Category', 'Level', 'Created At'];
    const rows = filteredQuestions.map(q => [
      q.id,
      q.question,
      Array.isArray(q.options) ? q.options.join('; ') : (q.options ? JSON.parse(q.options).join('; ') : ''),
      q.correct_answer,
      q.category || '-',
      q.level || '-',
      q.created_at ? new Date(q.created_at).toLocaleString() : '-',
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' +
      headers.join(',') + '\n' +
      rows.map(e => e.map(v => `"${v}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `questions_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    // Header
    doc.setFontSize(22);
    doc.text('Questions Report', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 10, 10, { align: 'right' });
    // Filter summary
    let filterSummary = '';
    if (categoryFilter) filterSummary += `Category: ${categoryFilter}  `;
    if (levelFilter) filterSummary += `Level: ${levels.find(l => l.id === levelFilter || l.name === levelFilter)?.name || levelFilter}  `;
    if (dateFrom) filterSummary += `From: ${dateFrom}  `;
    if (dateTo) filterSummary += `To: ${dateTo}`;
    if (filterSummary) {
      doc.setFontSize(11);
      doc.text(filterSummary, 10, 28);
    }
    // Table
    doc.autoTable({
      startY: filterSummary ? 34 : 28,
      head: [['ID', 'Question', 'Options', 'Answer', 'Category', 'Level', 'Created At']],
      body: filteredQuestions.map(q => [
        q.id,
        q.question,
        Array.isArray(q.options) ? q.options.join('; ') : (q.options ? JSON.parse(q.options).join('; ') : ''),
        q.correct_answer,
        q.category || '-',
        q.level || '-',
        q.created_at ? new Date(q.created_at).toLocaleString() : '-',
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
    doc.save(`questions_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (loading) return <div className="ml-64 p-8 text-lg text-gray-600">Loading questions...</div>;
  if (error) return <div className="ml-64 p-8 text-lg text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 ml-64 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">All Questions</h2>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by question, category, or level..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800"
            />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <option value="">All Levels</option>
              {levels.map(level => <option key={level.id} value={level.name}>{level.name}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-lg bg-white" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-lg bg-white" />
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">Export CSV</button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition-colors">Export PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Question</th>
                <th className="py-3 px-4 text-left font-semibold">Options</th>
                <th className="py-3 px-4 text-left font-semibold">Answer</th>
                <th className="py-3 px-4 text-left font-semibold">Category</th>
                <th className="py-3 px-4 text-left font-semibold">Level</th>
                <th className="py-3 px-4 text-left font-semibold">Created At</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 px-4 text-center text-gray-500 text-lg">No questions found.</td>
                </tr>
              ) : (
                filteredQuestions.map(q => (
                  <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 text-gray-700">{q.id}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{q.question}</td>
                    <td className="py-3 px-4 text-gray-700">{Array.isArray(q.options) ? q.options.join(', ') : (q.options ? JSON.parse(q.options).join(', ') : '')}</td>
                    <td className="py-3 px-4 text-green-700 font-semibold">{q.correct_answer}</td>
                    <td className="py-3 px-4 text-blue-700">{q.category || '-'}</td>
                    <td className="py-3 px-4">{q.level || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{q.created_at ? new Date(q.created_at).toLocaleString() : '-'}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => handleEdit(q)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(q.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Edit Modal */}
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button onClick={() => setEditModal({ open: false, question: null })} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
              <h3 className="text-xl font-bold mb-4">Edit Question</h3>
              <div className="mb-2">
                <label>Question:</label>
                <input type="text" value={editModal.question.question} onChange={e => handleEditChange('question', e.target.value)} className="w-full border p-2" />
              </div>
              {Array.isArray(editModal.question.options) ? editModal.question.options : (editModal.question.options ? JSON.parse(editModal.question.options) : []).map((opt, idx) => (
                <div className="mb-2" key={idx}>
                  <label>Option {idx + 1}:</label>
                  <input type="text" value={opt} onChange={e => handleEditOptionChange(idx, e.target.value)} className="w-full border p-2" />
                </div>
              ))}
              <div className="mb-2">
                <label>Correct Answer:</label>
                <input type="text" value={editModal.question.correct_answer} onChange={e => handleEditChange('correct_answer', e.target.value)} className="w-full border p-2" />
              </div>
              <div className="mb-2">
                <label>Category:</label>
                <input type="text" value={editModal.question.category || ''} onChange={e => handleEditChange('category', e.target.value)} className="w-full border p-2" />
              </div>
              <div className="mb-2">
                <label>Level:</label>
                <select value={editModal.question.level_id || levels.find(l => l.name === editModal.question.level)?.id || ''} onChange={e => handleEditChange('level_id', e.target.value)} className="w-full border p-2">
                  <option value="">Select level</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleEditSave} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Save Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionsPage; 