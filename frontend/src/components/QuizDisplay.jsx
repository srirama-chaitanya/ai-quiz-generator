import React from 'react';

function QuizDisplay({
  quizData,
  userAnswers,
  onAnswerSelect,
  showResults,
}) {
  if (!quizData) {
    return null;
  }

  const { title, summary, key_entities, quiz, related_topics } = quizData;

  // Helper function to get the style for each option
  const getOptionClass = (questionIndex, option) => {
    if (!showResults) {
      // Quiz-taking mode
      return userAnswers[questionIndex] === option
        ? 'bg-blue-200 border-blue-400 cursor-pointer' // Selected
        : 'bg-white hover:bg-gray-100 cursor-pointer'; // Not selected
    } else {
      // Results mode
      const isCorrect = option === quiz[questionIndex].answer;
      const isUserSelected = userAnswers[questionIndex] === option;

      if (isCorrect) {
        return 'bg-green-100 border-green-300 text-green-800 font-medium'; // Correct answer
      }
      if (isUserSelected && !isCorrect) {
        return 'bg-red-100 border-red-300 text-red-800 font-medium'; // User's wrong answer
      }
      return 'bg-gray-50 text-gray-600'; // Other wrong options
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>

      {/* Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xl font-semibold mb-2 text-blue-800">Summary</h3>
        <p className="text-gray-700">{summary}</p>
      </div>

      {/* Quiz Questions */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Quiz Questions</h3>
        <div className="space-y-4">
          {quiz.map((q, questionIndex) => (
            <div key={questionIndex} className="p-4 border border-gray-200 rounded-lg shadow-sm">
              <p className="font-semibold text-lg mb-2">
                {questionIndex + 1}. {q.question}
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {q.difficulty}
                </span>
              </p>
              
              {/* Interactive Options */}
              <div className="space-y-2 ml-4">
                {q.options.map((option, i) => (
                  <button
                    key={i}
                    disabled={showResults} // Disable buttons after submitting
                    onClick={() => onAnswerSelect(questionIndex, option)}
                    className={`
                      block w-full text-left p-3 border rounded-lg 
                      ${getOptionClass(questionIndex, option)}
                      ${!showResults ? 'transition-all duration-150' : ''}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Explanation (only shown after results) */}
              {showResults && (
                <p className="text-sm text-gray-600 mt-3 ml-4 p-2 bg-gray-50 rounded">
                  <span className="font-semibold">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Entities & Related Topics (only shown after results) */}
      {showResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Key Entities</h3>
            {key_entities.people?.length > 0 && (
              <p className="text-sm"><strong>People:</strong> {key_entities.people.join(', ')}</p>
            )}
            {key_entities.organizations?.length > 0 && (
              <p className="text-sm"><strong>Organizations:</strong> {key_entities.organizations.join(', ')}</p>
            )}
            {key_entities.locations?.length > 0 && (
              <p className="text-sm"><strong>Locations:</strong> {key_entities.locations.join(', ')}</p>
            )}
          </div>
          <div className="p-4 bg-gray-50 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Related Topics</h3>
            <ul className="list-disc list-inside space-y-1">
              {related_topics.map((topic, i) => (
                <li key={i} className="text-sm">{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizDisplay;