import React, { useState } from 'react';
import { GenerateTab } from './components/GenerateTab';
import { HistoryTab } from './components/HistoryTab';
import { BrainCircuit, Library } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
    const [activeTab, setActiveTab] = useState('generate');

    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [loading, setLoading] = useState(false);

    // History State (Cache)
    const [history, setHistory] = useState([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const refreshHistory = async () => {
        try {
            const { getHistory } = await import('./api');
            const data = await getHistory();
            setHistory(data);
            setHistoryLoaded(true);
        } catch (error) {
            console.error("Failed to load history:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 bg-opacity-80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-900">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        WikiQuiz
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('generate')}
                            className={clsx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'generate' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Generate
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={clsx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Library className="w-4 h-4" />
                            History
                        </button>
                    </div>
                </div>
            </nav>

            <main className="py-12">
                {activeTab === 'generate' ? (
                    <GenerateTab
                        quiz={currentQuiz}
                        setQuiz={setCurrentQuiz}
                        loading={loading}
                        setLoading={setLoading}
                        onQuizGenerated={refreshHistory}
                    />
                ) : (
                    <HistoryTab
                        history={history}
                        dataLoaded={historyLoaded}
                        onLoadNeeded={refreshHistory}
                    />
                )}
            </main>
        </div>
    );
}

function SparklesIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}

export default App;
