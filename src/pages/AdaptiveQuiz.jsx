import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LEVELS = ['Easy', 'Medium', 'Hard', 'Expert'];
const PLACEHOLDER_EXPLANATIONS = {
  Easy: 'This is an easy question. Remember, basics are important in cybersecurity!',
  Medium: 'Medium questions test your applied knowledge. Stay sharp!',
  Hard: 'Hard questions challenge your understanding. Keep learning!',
  Expert: 'Expert questions are for advanced users. Great job reaching this level!'
};
const PLACEHOLDER_TIPS = [
  'Tip: Always use unique passwords for each account.',
  'Tip: Beware of phishing emails and suspicious links.',
  'Tip: Enable two-factor authentication for extra security.',
  'Tip: Keep your software and devices updated.',
  'Tip: Never share sensitive information over unsecured channels.'
];

const AdaptiveQuiz = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [usedIds, setUsedIds] = useState([]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(1); // Start at 'Medium'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [adaptionMsg, setAdaptionMsg] = useState('');
  const { user } = useAuth();
  const MAX_QUESTIONS = 10;

  useEffect(() => {
    fetch('/api/admin/questions')
      .then(res => res.json())
      .then(data => setAllQuestions(Array.isArray(data.questions) ? data.questions : []));
  }, []);

  useEffect(() => {
    if (allQuestions.length > 0 && !currentQuestion) {
      pickNextQuestion(currentLevelIdx);
    }
    // eslint-disable-next-line
  }, [allQuestions]);

  const pickNextQuestion = (levelIdx) => {
    const levelName = LEVELS[levelIdx];
    const pool = allQuestions.filter(
      q => (q.level || q.difficulty) === levelName && !usedIds.includes(q.id)
    );
    if (pool.length === 0) {
      // If no questions left at this level, try to find at any level
      const remaining = allQuestions.filter(q => !usedIds.includes(q.id));
      if (remaining.length === 0) {
        setShowScore(true);
        return;
      }
      setCurrentQuestion(remaining[Math.floor(Math.random() * remaining.length)]);
      return;
    }
    setCurrentQuestion(pool[Math.floor(Math.random() * pool.length)]);
  };

  const handleAnswer = async (selected) => {
    const correct = selected === currentQuestion.correct_answer;
    setAnswers(prev => [...prev, { id: currentQuestion.id, selected, correct }]);
    setUsedIds([...usedIds, currentQuestion.id]);
    setScore(s => correct ? s + 1 : s);
    setQuestionCount(qc => qc + 1);

    // Decide next level
    let nextLevelIdx = currentLevelIdx;
    let adaption = '';
    if (correct && currentLevelIdx < LEVELS.length - 1) {
      nextLevelIdx++;
      adaption = 'Great job! You are getting a harder question next.';
    }
    if (!correct && currentLevelIdx > 0) {
      nextLevelIdx--;
      adaption = 'You will get an easier question next. Keep practicing!';
    }

    // Show feedback
    const explanation = PLACEHOLDER_EXPLANATIONS[currentQuestion.level || LEVELS[currentLevelIdx]];
    const tip = PLACEHOLDER_TIPS[Math.floor(Math.random() * PLACEHOLDER_TIPS.length)];
    setFeedback({
      correct,
      explanation,
      tip
    });
    setAdaptionMsg(adaption);

    if (questionCount + 1 >= MAX_QUESTIONS) {
      setShowScore(true);
      // Send results to backend
      try {
        const token = localStorage.getItem('token');
        const level_id = currentQuestion.level_id || null;
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: score + (correct ? 1 : 0),
            total_questions: questionCount + 1,
            level_id,
            answers: [...answers, { question_id: currentQuestion.id, selected, correct }],
          }),
        });
        setSubmitMessage('Your attempt has been recorded!');
      } catch (err) {
        setSubmitMessage('Could not record your attempt.');
      }
    } else {
      setTimeout(() => {
        setFeedback(null);
        setAdaptionMsg('');
        setCurrentLevelIdx(nextLevelIdx);
        pickNextQuestion(nextLevelIdx);
      }, 1800); // 1.8s delay for feedback
    }
  };

  if (showScore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 text-green-700">Quiz Complete!</h2>
          <p className="text-lg mb-2">Your score: <span className="font-bold">{score} / {questionCount}</span></p>
          {submitMessage && <div className="mb-2 text-blue-600">{submitMessage}</div>}
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading question...</div>
      </div>
    );
  }

  const options = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : JSON.parse(currentQuestion.options);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Question {questionCount + 1} of {MAX_QUESTIONS}</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded ${currentQuestion.level === 'Easy' ? 'bg-green-100 text-green-700' : currentQuestion.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' : currentQuestion.level === 'Hard' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>{currentQuestion.level ? `Level: ${currentQuestion.level}` : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((questionCount + 1) / MAX_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">{currentQuestion.question}</h2>
        <form className="w-full">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className={`block w-full mb-3 px-4 py-3 rounded-lg border text-left transition-all
                bg-gray-50 border-gray-200 hover:bg-blue-50 ${feedback ? 'pointer-events-none opacity-60' : ''}`}
              onClick={() => !feedback && handleAnswer(opt)}
              disabled={!!feedback}
            >
              {opt}
            </button>
          ))}
        </form>
        {feedback && (
          <div className="w-full mt-4 p-4 rounded-lg shadow-inner bg-gray-50 border border-gray-200 text-center animate-fade-in">
            <div className={`text-lg font-bold mb-2 ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>{feedback.correct ? 'Correct!' : 'Incorrect'}</div>
            <div className="text-gray-700 mb-1">{feedback.explanation}</div>
            <div className="text-blue-600 text-sm mb-1">{feedback.tip}</div>
            {adaptionMsg && <div className="text-xs text-purple-600 mt-2">{adaptionMsg}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveQuiz; 