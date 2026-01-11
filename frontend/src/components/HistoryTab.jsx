import React, { useEffect, useState } from 'react';
import { QuizCard } from './QuizCard';
import { Calendar, ChevronRight, Search, Play, Eye, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

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

            {/* History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{dataLoaded ? "No quizzes found" : "Loading your history..."}</h3>
                        <p className="text-gray-500 mt-1">Try generating a new quiz to get started.</p>
                    </div>
                ) : (
                    filteredQuizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                            {/* Decorative Gradient Top */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {quiz.questions.length} Questions
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(quiz.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight h-14">
                                {quiz.title}
                            </h3>
                            <div className="text-xs text-gray-400 truncate mb-6 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                {quiz.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </div>

                            {/* Score & Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Last Score</div>
                                    <div className="flex items-baseline gap-1">
                                        {quiz.last_score !== null && quiz.last_score !== undefined ? (
                                            <>
                                                <span className={clsx(
                                                    "text-2xl font-extrabold",
                                                    quiz.last_score === quiz.questions.length ? "text-green-600" :
                                                        quiz.last_score >= quiz.questions.length / 2 ? "text-indigo-600" : "text-orange-500"
                                                )}>
                                                    {quiz.last_score}
                                                </span>
                                                <span className="text-gray-400 text-sm font-medium">/{quiz.questions.length}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-lg font-medium">-</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {quiz.last_answers && (
                                        <button
                                            onClick={() => handleReview(quiz)}
                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Review Results"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStart(quiz)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all",
                                            quiz.last_answers
                                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                                        )}
                                    >
                                        {quiz.last_answers ? (
                                            <>
                                                <RotateCcw className="w-4 h-4" />
                                                Retry
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 fill-current" />
                                                Start
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
                                onQuizCompleted={onLoadNeeded}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
