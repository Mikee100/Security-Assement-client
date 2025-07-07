import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, questions, answers } = location.state || {};

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <Link to="/quiz" className="text-blue-600 hover:text-blue-500">
            Take a Quiz
          </Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, correctAnswers, results: questionResults } = results;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent! You have excellent security awareness.';
    if (score >= 80) return 'Great job! You have good security awareness.';
    if (score >= 70) return 'Good work! You have decent security awareness.';
    if (score >= 60) return 'Fair. You need to improve your security awareness.';
    return 'Poor. You need to significantly improve your security awareness.';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
            
            <div className="mb-6">
              <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                {score}%
              </div>
              <p className="text-lg text-gray-600 mb-4">{getScoreMessage(score)}</p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
                  <div className="text-sm text-gray-500">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{totalQuestions}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                to="/quiz"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Take Another Quiz
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
          
          <div className="space-y-6">
            {questionResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {index + 1}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{result.question}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-24">Your Answer:</span>
                    <span className={`font-medium ${
                      result.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.userAnswer}
                    </span>
                  </div>
                  
                  {!result.isCorrect && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">Correct Answer:</span>
                      <span className="font-medium text-green-600">{result.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results; 