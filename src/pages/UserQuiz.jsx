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
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [comments, setComments] = useState('');
  const [timer, setTimer] = useState(0);

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

  // Start timer when quiz starts
  useEffect(() => {
    let interval;
    if (quizStarted && startTime) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, startTime]);

  if (!quizStarted) {
    return (
      <div  className="flex items-center justify-center min-h-screen bg-gray-100">
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
            onClick={() => { setQuizStarted(true); setStartTime(Date.now()); }}
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
      let correctByCategory = {};
      let totalByCategory = {};
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correct_answer) {
          s++;
          correctByCategory[q.category] = (correctByCategory[q.category] || 0) + 1;
        }
        totalByCategory[q.category] = (totalByCategory[q.category] || 0) + 1;
      });
      setScore(s);
      setShowScore(true);
      setEndTime(Date.now());
      setTimeTaken(timer);
      // Analyze strengths/weaknesses and generate detailed comment
      let strong = [];
      let weak = [];
      let details = [];
      Object.keys(totalByCategory).forEach(cat => {
        const correct = correctByCategory[cat] || 0;
        const total = totalByCategory[cat];
        const percent = correct / total;
        details.push(`${cat}: ${correct}/${total} correct (${Math.round(percent * 100)}%)`);
        if (percent >= 0.8) strong.push(cat);
        else if (percent <= 0.5) weak.push(cat);
      });
      const percentScore = Math.round((s / questions.length) * 100);
      let commentMsg = `You scored ${s} out of ${questions.length} (${percentScore}%).\n`;
      commentMsg += `\nCategory breakdown:\n- ${details.join('\n- ')}\n`;
      if (strong.length > 0) commentMsg += `\nYour strengths: ${strong.join(', ')}.`;
      if (weak.length > 0) commentMsg += `\nAreas to improve: ${weak.join(', ')}.`;
      if (percentScore === 100) commentMsg += "\nOutstanding! You got a perfect score.";
      else if (percentScore >= 80) commentMsg += "\nExcellent work! Keep it up.";
      else if (percentScore >= 60) commentMsg += "\nGood job, but there's room for improvement.";
      else commentMsg += "\nConsider reviewing the material and trying again.";
      if (timer <= questions.length * 30) commentMsg += "\nYou completed the quiz quickly!";
      else if (timer > questions.length * 90) commentMsg += "\nTake your time to read each question carefully next time.";
      setComments(commentMsg);
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
            time_taken: timer,
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#e6fffa" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" stroke="#38a169" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold mb-2 text-green-700 text-center">Quiz Complete!</h2>
          <div className="flex flex-col items-center mb-4 w-full">
            <span className="text-2xl font-bold text-blue-900">Score: {score} / {questions.length}</span>
            <span className="text-lg text-blue-700 mt-1">Time taken: {formatTime(timeTaken)}</span>
          </div>
          <div className="w-full mb-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow text-gray-800 text-base whitespace-pre-wrap text-center font-medium">
              {comments}
            </div>
          </div>
          {submitMessage && <div className="mb-2 text-blue-600">{submitMessage}</div>}
          <div className="flex gap-4 mt-6 w-full justify-center">
            <button
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 text-lg font-semibold transition"
              onClick={() => window.location.reload()}
            >
              Retake Quiz
            </button>
            <button
              className="bg-gray-500 text-white px-8 py-3 rounded-lg shadow hover:bg-gray-700 text-lg font-semibold transition"
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
    <div className="bg-[url('/pexels-pixabay-60504.jpg')] flex items-center justify-center min-h-screen bg-gray-100">
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
        {/* Timer display during quiz */}
        <div className="w-full flex justify-end mb-2">
          <span className="text-sm text-blue-700 font-semibold">Time: {formatTime(timer)}</span>
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

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 