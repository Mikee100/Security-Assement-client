import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LEVELS = ['Easy', 'Medium', 'Hard', 'Expert'];

// Animation helpers
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const UserQuiz = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const { user } = useAuth();
  const [submitMessage, setSubmitMessage] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [maxAvailable, setMaxAvailable] = useState(0);
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [comments, setComments] = useState('');
  const [timer, setTimer] = useState(0);
  const [randomize, setRandomize] = useState(true);
  const [numWarning, setNumWarning] = useState('');
  const [quizMode, setQuizMode] = useState(() => localStorage.getItem('quizMode') || 'practice');
  const [showAnswers, setShowAnswers] = useState(() => localStorage.getItem('showAnswers') === 'true');
  const [difficultyMix, setDifficultyMix] = useState(() => {
    const saved = localStorage.getItem('difficultyMix');
    return saved ? JSON.parse(saved) : { Easy: 50, Medium: 30, Hard: 20, Expert: 0 };
  });
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(''); // 'left' or 'right'
  const [quizFadeIn, setQuizFadeIn] = useState(false);
  const [flagged, setFlagged] = useState([]); // array of question indices

  // Toggle flag for current question
  const toggleFlag = () => {
    setFlagged(f => f.includes(current) ? f.filter(i => i !== current) : [...f, current]);
  };

  // Jump to flagged question
  const jumpTo = idx => {
    if (!transitioning) setCurrent(idx);
  };

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCategory', selectedCategory);
    localStorage.setItem('selectedLevel', selectedLevel);
    localStorage.setItem('numQuestions', numQuestions);
    localStorage.setItem('randomize', randomize);
    localStorage.setItem('quizMode', quizMode);
    localStorage.setItem('showAnswers', showAnswers);
    localStorage.setItem('difficultyMix', JSON.stringify(difficultyMix));
  }, [selectedCategory, selectedLevel, numQuestions, randomize, quizMode, showAnswers, difficultyMix]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const cat = localStorage.getItem('selectedCategory');
    if (cat) setSelectedCategory(cat);
    const lvl = localStorage.getItem('selectedLevel');
    if (lvl) setSelectedLevel(lvl);
    const num = localStorage.getItem('numQuestions');
    if (num) setNumQuestions(Number(num));
    const rand = localStorage.getItem('randomize');
    if (rand !== null) setRandomize(rand === 'true');
    const mode = localStorage.getItem('quizMode');
    if (mode) setQuizMode(mode);
    const showA = localStorage.getItem('showAnswers');
    if (showA !== null) setShowAnswers(showA === 'true');
    const mix = localStorage.getItem('difficultyMix');
    if (mix) setDifficultyMix(JSON.parse(mix));
  }, []);

  // Build question pool based on difficulty mix if enabled
  const buildMixedQuestions = () => {
    let pool = [];
    let total = 0;
    Object.entries(difficultyMix).forEach(([level, percent]) => {
      if (percent > 0) {
        const levelQs = filteredQuestions.filter(q => (q.level || q.difficulty) === level);
        const count = Math.round((percent / 100) * numQuestions);
        pool = pool.concat(levelQs.slice(0, count));
        total += count;
      }
    });
    // If not enough due to rounding, fill with random from all
    if (pool.length < numQuestions) {
      const remaining = filteredQuestions.filter(q => !pool.includes(q));
      pool = pool.concat(remaining.slice(0, numQuestions - pool.length));
    }
    if (randomize) pool = pool.sort(() => 0.5 - Math.random());
    return pool.slice(0, numQuestions);
  };

  // Start quiz: use mix if enabled, else normal
  const handleStartQuiz = () => {
    let pool;
    if (useMix) {
      pool = buildMixedQuestions();
    } else {
      pool = [...filteredQuestions];
      if (randomize) pool = pool.sort(() => 0.5 - Math.random());
      pool = pool.slice(0, numQuestions);
    }
    setQuestions(pool);
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  // UI state for enabling mix
  const [useMix, setUseMix] = useState(() => localStorage.getItem('useMix') === 'true');
  useEffect(() => { localStorage.setItem('useMix', useMix); }, [useMix]);

  // Fetch all questions on mount
  useEffect(() => {
    fetch(`/api/admin/questions`)
      .then(res => res.json())
      .then(data => {
        const all = Array.isArray(data.questions) ? data.questions : [];
        setAllQuestions(all);
        // Extract unique categories
        const cats = Array.from(new Set(all.map(q => q.category).filter(Boolean)));
        setCategories(cats);
      });
  }, []);

  // Filter questions based on selected category and level
  const filteredQuestions = allQuestions.filter(q => {
    const catMatch = selectedCategory ? q.category === selectedCategory : true;
    const levelMatch = selectedLevel ? (q.level || q.difficulty) === selectedLevel : true;
    return catMatch && levelMatch;
  });

  // Update maxAvailable and numQuestions when filters change
  useEffect(() => {
    setMaxAvailable(filteredQuestions.length);
    if (filteredQuestions.length < numQuestions) {
      setNumQuestions(filteredQuestions.length);
    }
  }, [selectedCategory, selectedLevel, allQuestions]);

  // Validation for numQuestions
  useEffect(() => {
    if (numQuestions > maxAvailable) {
      setNumQuestions(maxAvailable);
      setNumWarning(`Number of questions reduced to ${maxAvailable} (max available).`);
    } else {
      setNumWarning('');
    }
  }, [numQuestions, maxAvailable]);

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

  // Animate quiz start
  useEffect(() => {
    if (quizStarted) {
      setQuizFadeIn(true);
    }
  }, [quizStarted]);

  if (!quizStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 transition-opacity duration-500 opacity-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-center">Start User Quiz</h2>
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
            <div className="flex gap-2 mb-2">
              {[5, 10, 20].map(val => (
                <button
                  key={val}
                  type="button"
                  className={`px-3 py-1 rounded border text-sm font-semibold transition-colors ${numQuestions === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-100'}`}
                  onClick={() => setNumQuestions(Math.min(val, maxAvailable))}
                  disabled={maxAvailable < val}
                >
                  {val}
                </button>
              ))}
              <button
                type="button"
                className={`px-3 py-1 rounded border text-sm font-semibold transition-colors ${numQuestions === maxAvailable ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-100'}`}
                onClick={() => setNumQuestions(maxAvailable)}
                disabled={maxAvailable === 0}
              >
                All
              </button>
            </div>
            <input
              type="range"
              min={1}
              max={Math.max(1, maxAvailable)}
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full"
              disabled={maxAvailable === 0}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{maxAvailable}</span>
            </div>
            <input
              type="number"
              min={1}
              max={Math.max(1, maxAvailable)}
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-2"
              disabled={maxAvailable === 0}
            />
            <div className="text-sm text-blue-700 mt-1">
              You can attempt up to {maxAvailable} question{maxAvailable !== 1 ? 's' : ''}.
            </div>
            {numWarning && <div className="text-sm text-red-600 mt-1">{numWarning}</div>}
          </div>
          <div className="mb-4 w-full flex items-center">
            <input
              id="randomize"
              type="checkbox"
              checked={randomize}
              onChange={e => setRandomize(e.target.checked)}
              className="mr-2 accent-blue-600"
            />
            <label htmlFor="randomize" className="text-sm text-gray-700 select-none cursor-pointer">Randomize question order</label>
          </div>
          <div className="mb-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="quizMode" value="practice" checked={quizMode === 'practice'} onChange={() => setQuizMode('practice')} className="accent-blue-600" />
                Practice Mode
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="quizMode" value="exam" checked={quizMode === 'exam'} onChange={() => setQuizMode('exam')} className="accent-blue-600" />
                Exam Mode
              </label>
            </div>
          </div>
          {quizMode === 'practice' && (
            <div className="mb-4 w-full flex items-center">
              <input
                id="showAnswers"
                type="checkbox"
                checked={showAnswers}
                onChange={e => setShowAnswers(e.target.checked)}
                className="mr-2 accent-blue-600"
              />
              <label htmlFor="showAnswers" className="text-sm text-gray-700 select-none cursor-pointer">Show correct answers after each question</label>
            </div>
          )}
          <div className="mb-4 w-full flex items-center">
            <input
              id="useMix"
              type="checkbox"
              checked={useMix}
              onChange={e => setUseMix(e.target.checked)}
              className="mr-2 accent-blue-600"
            />
            <label htmlFor="useMix" className="text-sm text-gray-700 select-none cursor-pointer">Use difficulty mix</label>
          </div>
          {useMix && (
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Mix (%)</label>
              {LEVELS.map(level => (
                <div key={level} className="flex items-center gap-2 mb-1">
                  <span className="w-16 text-gray-700">{level}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={difficultyMix[level] || 0}
                    onChange={e => {
                      const val = Math.max(0, Math.min(100, Number(e.target.value)));
                      setDifficultyMix({ ...difficultyMix, [level]: val });
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-1">Total: {Object.values(difficultyMix).reduce((a, b) => a + Number(b), 0)}%</div>
            </div>
          )}
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={handleStartQuiz}
            disabled={maxAvailable === 0}
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
      setDirection('right');
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(current + 1);
        setTransitioning(false);
      }, 250);
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
    if (current > 0) {
      setDirection('left');
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(current - 1);
        setTransitioning(false);
      }, 250);
    }
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
    <div className={classNames(
      "bg-[url('/pexels-pixabay-60504.jpg')] flex items-center justify-center min-h-screen bg-gray-100",
      quizFadeIn ? 'animate-fade-in' : ''
    )}>
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        {/* Progress Bar with Flagged Indicator */}
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
          {/* Question Navigation with Flagged Indicator */}
          <div className="flex flex-wrap gap-1 mt-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => jumpTo(idx)}
                className={classNames(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border',
                  current === idx
                    ? 'bg-blue-600 text-white border-blue-700'
                    : answers[idx] != null
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300',
                  flagged.includes(idx) ? 'ring-2 ring-yellow-400 relative' : ''
                )}
                title={flagged.includes(idx) ? 'Flagged for review' : 'Go to question'}
              >
                {idx + 1}
                {flagged.includes(idx) && (
                  <span className="absolute -top-1 -right-1 text-yellow-400 text-lg">★</span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Timer display during quiz */}
        <div className="w-full flex justify-end mb-2">
          <span className="text-sm text-blue-700 font-semibold">Time: {formatTime(timer)}</span>
        </div>
        {/* Flag/Bookmark Button */}
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={toggleFlag}
            className={classNames(
              'flex items-center gap-1 px-3 py-1 rounded transition-colors text-sm font-semibold',
              flagged.includes(current)
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-400'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-yellow-50'
            )}
            title={flagged.includes(current) ? 'Unflag this question' : 'Flag for review'}
          >
            <span>{flagged.includes(current) ? '★' : '☆'}</span> {flagged.includes(current) ? 'Flagged' : 'Flag'}
          </button>
        </div>
        {/* Animate question card */}
        <div className={classNames(
          'w-full',
          'transition-transform duration-300 ease-in-out',
          transitioning
            ? direction === 'right'
              ? 'translate-x-full opacity-0'
              : 'translate-x-[-100%] opacity-0'
            : 'translate-x-0 opacity-100'
        )}>
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
                {/* Show correct answer in practice mode if enabled and answered */}
                {quizMode === 'practice' && showAnswers && answers[current] && (
                  <span className={`ml-3 text-sm font-semibold ${answers[current] === q.correct_answer ? 'text-green-600' : 'text-red-600'}`}> 
                    {answers[current] === q.correct_answer ? 'Correct!' : `Correct: ${q.correct_answer}`}
                  </span>
                )}
              </label>
            ))}
          </form>
        </div>
        <div className="flex w-full justify-between mt-6">
          <button
            onClick={handlePrev}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400"
            disabled={current === 0 || transitioning}
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (flagged.length > 0 && current === questions.length - 1) {
                if (!window.confirm('You have flagged questions for review. Are you sure you want to submit?')) return;
              }
              handleNext();
            }}
            className={`bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-all ${answers[current] == null ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={answers[current] == null || transitioning}
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