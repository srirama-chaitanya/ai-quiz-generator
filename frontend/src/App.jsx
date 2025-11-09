import React, { useState, useEffect } from 'react';
import GenerateQuizTab from './tabs/GenerateQuizTab';
import HistoryTab from './tabs/HistoryTab'; 

// Import all API functions here
import { generateQuiz, getHistory, getQuizById } from './services/api';
import Modal from './components/Modal'; // Import Modal here
import QuizDisplay from './components/QuizDisplay'; // Import QuizDisplay here

function App() {
  const [activeTab, setActiveTab] = useState('generate');

  // === State for GenerateQuizTab ===
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // === State for HistoryTab (Lifted Up) ===
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // --- Fetch history *once* when the app loads ---
  useEffect(() => {
    loadHistory();
  }, []); // Empty array means this runs only once on mount

  const loadHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const data = await getHistory();
      setHistoryList(data);
      setHistoryError(null); // Clear any previous errors
    } catch (err) {
      setHistoryError(err.message || 'Failed to fetch history.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // --- Handlers for GenerateQuizTab ---
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    
    // --- URL VALIDATION ---
    if (!url.includes('wikipedia.org')) {
      setError("Please enter a valid Wikipedia URL (must include 'wikipedia.org').");
      return; // Stop the function
    }
    // --- END OF VALIDATION ---

    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    
    try {
      const data = await generateQuiz(url);
      setQuizData(data);
      setUserAnswers(new Array(data.quiz.length).fill(null));
      loadHistory(); // Refresh history list
      
      // --- OPTIMIZATION: Clear URL on success ---
      setUrl(''); 
      // --- END OF OPTIMIZATION ---

    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    
    // --- THIS IS THE FIX ---
    // We must compare the user's answer to the *quiz's* correct answer
    for (let i = 0; i < quizData.quiz.length; i++) {
      if (userAnswers[i] === quizData.quiz[i].answer) {
        correctAnswers++;
      }
    }
    // --- END OF FIX ---
    
    setScore(correctAnswers);
    setShowResults(true);
    setError(null); // Clear any validation errors
  };
  
  // --- Handlers for HistoryTab (Lifted Up) ---
  const handleDetailsClick = async (quizId) => {
    try {
      setIsModalLoading(true);
      setIsModalOpen(true);
      const data = await getQuizById(quizId);
      setSelectedQuiz(data);
      setHistoryError(null); // Clear list error when opening modal
    } catch (err) {
      setHistoryError(err.message || 'Failed to fetch quiz details.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
  };

  // --- Tab Styling ---
  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? 'px-4 py-2 font-semibold text-white bg-blue-600 rounded-t-lg'
      : 'px-4 py-2 font-medium text-blue-700 bg-gray-100 rounded-t-lg hover:bg-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 my-6">
          🧠 AI Wiki Quiz Generator
        </h1>

        <div className="flex border-b border-gray-300">
          <button
            className={getTabClass('generate')}
            onClick={() => setActiveTab('generate')}
          >
            Generate Quiz
          </button>
          <button
            className={getTabClass('history')}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="py-6 px-4 bg-white shadow-md rounded-b-lg">
          
          {activeTab === 'generate' && (
            <GenerateQuizTab
              url={url}
              setUrl={setUrl}
              isLoading={isLoading}
              error={error}
              quizData={quizData}
              userAnswers={userAnswers}
              showResults={showResults}
              score={score}
              onUrlSubmit={handleUrlSubmit}
              onAnswerSelect={handleAnswerSelect}
              onSubmitQuiz={handleSubmitQuiz}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              historyList={historyList}
              isLoading={isHistoryLoading}
              error={historyError}
              onDetailsClick={handleDetailsClick}
            />
          )}
        </div>

        {/* --- The Modal is now part of App.jsx --- */}
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Quiz Details">
          {isModalLoading ? (
            <p className="text-center text-gray-500">Loading quiz details...</p>
          ) : selectedQuiz ? (
            <QuizDisplay
              quizData={selectedQuiz}
              userAnswers={{}}
              onAnswerSelect={() => {}}
              showResults={true} // Force read-only mode
            />
          ) : (
            <p className="text-center text-red-500">{historyError || 'Could not load quiz data.'}</p>
          )}
        </Modal>
        
      </div>
    </div>
  );
}

export default App;