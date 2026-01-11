import React, { useEffect, useState } from 'react';
import { QuizCard } from './QuizCard';
import { Calendar, ChevronRight, Search, Play, Eye, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HistoryTab = ({ history, dataLoaded, onLoadNeeded }) => {
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [reviewMode, setReviewMode] = useState(false); // true = review mode (see answers), false = new attempt
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!dataLoaded) {
            onLoadNeeded();
        }
    }, [dataLoaded, onLoadNeeded]);

    const filteredQuizzes = history.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStart = (quiz) => {
        setSelectedQuiz(quiz);
        setReviewMode(false);
    };

    const handleReview = (quiz) => {
        setSelectedQuiz(quiz);
        setReviewMode(true);
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">History</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Article Title</th>
                            <th className="px-6 py-4 text-center">Last Score</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredQuizzes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                    {dataLoaded ? "No quizzes found in history." : "Loading..."}
                                </td>
                            </tr>
                        ) : (
                            filteredQuizzes.map((quiz) => (
                                <tr key={quiz.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="truncate max-w-xs">{quiz.title}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-xs">{quiz.url}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {quiz.last_score !== null && quiz.last_score !== undefined ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {quiz.last_score} / {quiz.questions.length}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(quiz.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {quiz.last_answers && (
                                                <button
                                                    onClick={() => handleReview(quiz)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                                                    title="Review Past Performance"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Review
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStart(quiz)}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                                                title={quiz.last_answers ? "Re-attempt Quiz" : "Start Quiz"}
                                            >
                                                {quiz.last_answers ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                                {quiz.last_answers ? "Retry" : "Start"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {selectedQuiz && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedQuiz(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <QuizCard
                                quiz={selectedQuiz}
                                onClose={() => setSelectedQuiz(null)}
                                embedded
                                initialMode={reviewMode ? 'review' : 'quiz'}
                                initialAnswers={reviewMode && selectedQuiz.last_answers ? JSON.parse(selectedQuiz.last_answers) : {}}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
