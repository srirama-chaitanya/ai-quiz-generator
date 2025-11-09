import React from 'react';
// We don't need 'useState' or 'generateQuiz' here anymore
import QuizDisplay from '../components/QuizDisplay';

// All state and functions are passed in as props
function GenerateQuizTab({
  url,
  setUrl,
  isLoading,
  error,
  quizData,
  userAnswers,
  showResults,
  score,
  onUrlSubmit,
  onAnswerSelect,
  onSubmitQuiz
}) {

  return (
    <div>
      {/* === The Form === */}
      {/* We now use the functions and state from props */}
      <form onSubmit={onUrlSubmit} className="flex flex-col md:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a Wikipedia URL..."
          required
          className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="p-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>

      {/* === The Results Area === */}
      {/* This part is unchanged, it just reads from props */}
      <div className="mt-6">
        {isLoading && (
          <div className="text-center">
            <p className="text-lg font-medium text-blue-600">
              Generating your quiz...
            </p>
            <p className="text-sm text-gray-500">
              This can take up to 30 seconds. Please wait.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {quizData && (
          <>
            {showResults && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg text-center">
                <h3 className="text-2xl font-bold">
                  Your Score: {score} / {quizData.quiz.length}
                </h3>
              </div>
            )}
            
            <QuizDisplay
              quizData={quizData}
              userAnswers={userAnswers}
              onAnswerSelect={onAnswerSelect}
              showResults={showResults}
            />

            {!showResults && (
              <button
                onClick={onSubmitQuiz}
                className="w-full mt-6 p-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Submit Quiz
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GenerateQuizTab;