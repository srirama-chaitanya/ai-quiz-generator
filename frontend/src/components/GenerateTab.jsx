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
                <div className="text-center py-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 pb-1">
                        AI Wiki Quiz Generator
                    </h1>
                    <p className="text-gray-500 mb-10 text-lg">
                        Turn any Wikipedia article into an interactive quiz in seconds.
                    </p>

                    <form onSubmit={handleGenerate} className="max-w-2xl mx-auto relative">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex shadow-xl bg-white rounded-lg p-2">
                                <input
                                    type="url"
                                    className="flex-grow p-4 text-gray-700 focus:outline-none rounded-l-md"
                                    placeholder="Paste Wikipedia URL (e.g. https://en.wikipedia.org/wiki/Alan_Turing)"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generat...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg max-w-2xl mx-auto flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
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
                    <QuizCard key={quiz.id || 'generated'} quiz={quiz} />
                </div>
            )}
        </div>
    );
};
