import React, { useState } from 'react';
import { generateQuiz } from '../api';
import { QuizCard } from './QuizCard';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export const GenerateTab = ({ quiz, setQuiz, loading, setLoading, onQuizGenerated }) => {
    const [url, setUrl] = useState('');
    // const [loading, setLoading] = useState(false); // lifted to App
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setQuiz(null);

        try {
            const data = await generateQuiz(url);
            setQuiz(data);
            if (onQuizGenerated) onQuizGenerated();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to generate quiz. Please check the URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4">
            {!quiz ? (
                <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Powered by Gemini 2.0 Flash</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Turn Wikipedia into <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                                Interactive Quizzes
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Master any topic instantly. Just paste a link, and our AI will generate a challenging quiz to test your knowledge.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="w-full max-w-2xl mx-auto relative z-10 mb-16">
                        <form onSubmit={handleGenerate} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex shadow-2xl bg-white rounded-xl p-2 transform transition-transform group-hover:scale-[1.01]">
                                <input
                                    type="url"
                                    className="flex-grow p-4 md:p-5 text-lg text-gray-700 placeholder-gray-400 focus:outline-none rounded-l-lg bg-transparent"
                                    placeholder="Paste a Wikipedia URL here..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Building...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Generate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Quick Examples */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-semibold">Or try these examples</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {[
                                    { label: 'Alan Turing', url: 'https://en.wikipedia.org/wiki/Alan_Turing' },
                                    { label: 'Quantum Computing', url: 'https://en.wikipedia.org/wiki/Quantum_computing' },
                                    { label: 'The Renaissance', url: 'https://en.wikipedia.org/wiki/Renaissance' }
                                ].map((example) => (
                                    <button
                                        key={example.label}
                                        onClick={() => { setUrl(example.url); }}
                                        className="px-4 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded-full text-sm font-medium transition-all shadow-sm"
                                    >
                                        {example.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full px-4">
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">🔗</div>
                            <h3 className="font-bold text-gray-900 mb-2">1. Paste a Link</h3>
                            <p className="text-gray-500 text-sm">Copy any URL from Wikipedia. Our scraper extracts the key information automatically.</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">✨</div>
                            <h3 className="font-bold text-gray-900 mb-2">2. AI Generation</h3>
                            <p className="text-gray-500 text-sm">Gemini analyzes the content and crafts thoughtful multiple-choice questions.</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">🏆</div>
                            <h3 className="font-bold text-gray-900 mb-2">3. Test & Learn</h3>
                            <p className="text-gray-500 text-sm">Take the quiz, get instant feedback, and track your scores in history.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setQuiz(null)}
                            className="text-gray-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            &larr; Generate Another
                        </button>
                    </div>
                    <QuizCard key={quiz.id || 'generated'} quiz={quiz} onQuizCompleted={onQuizGenerated} />
                </div>
            )}
        </div>
    );
};
