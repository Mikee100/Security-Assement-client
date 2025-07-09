import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();
  const [submitMessage, setSubmitMessage] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizStarted) return;
    fetch(`/api/admin/questions`)
      .then(res => res.json())
      .then(data => {
        const all = Array.isArray(data.questions) ? data.questions : [];
        const shuffled = all.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, numQuestions));
      });
  }, [quizStarted, numQuestions]);

  if (!quizStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-center">Start User Quiz</h2>
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
            <input
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            onClick={() => setQuizStarted(true)}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">No questions available.</div>
      </div>
    );
  }

  const handleOptionChange = (e) => {
    setAnswers({ ...answers, [current]: e.target.value });
  };

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Calculate score
      let s = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correct_answer) s++;
      });
      setScore(s);
      setShowScore(true);
      // Send results to backend
      try {
        const token = localStorage.getItem('token');
        const level_id = questions[0]?.level_id || null;
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: s,
            total_questions: questions.length,
            level_id,
            answers: questions.map((q, idx) => ({
              questionId: q.id,
              selectedAnswer: answers[idx],
              correct: answers[idx] === q.correct_answer,
            })),
          }),
        });
        setSubmitMessage('Your attempt has been recorded!');
      } catch (err) {
        setSubmitMessage('Could not record your attempt.');
      }
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  if (showScore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 text-green-700">Quiz Complete!</h2>
          <p className="text-lg mb-2">Your score: <span className="font-bold">{score} / {questions.length}</span></p>
          {submitMessage && <div className="mb-2 text-blue-600">{submitMessage}</div>}
          <div className="flex gap-4 mt-4">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retake Quiz
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded shadow hover:bg-gray-700"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Question {current + 1} of {questions.length}</span>
            <span className="text-sm text-gray-600">{q.level ? `Level: ${q.level}` : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">{q.question}</h2>
        <form className="w-full">
          {options.map((opt, idx) => (
            <label
              key={idx}
              className={`block w-full mb-3 px-4 py-3 rounded-lg border cursor-pointer transition-all
                ${answers[current] === opt
                  ? 'bg-blue-100 border-blue-500 font-semibold'
                  : 'bg-gray-50 border-gray-200 hover:bg-blue-50'}`}
            >
              <input
                type="radio"
                name="option"
                value={opt}
                checked={answers[current] === opt}
                onChange={handleOptionChange}
                className="mr-3 accent-blue-600"
              />
              {opt}
            </label>
          ))}
        </form>
        <div className="flex w-full justify-between mt-6">
          <button
            onClick={handlePrev}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400"
            disabled={current === 0}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className={`bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-all ${answers[current] == null ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={answers[current] == null}
          >
            {current < questions.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserQuiz; 