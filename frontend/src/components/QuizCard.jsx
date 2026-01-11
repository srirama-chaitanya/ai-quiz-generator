import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, BookOpen, AlertCircle, Share2, HelpCircle, User, Building, MapPin, Tag, Play, Award, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { saveAttempt } from '../api';

export const QuizCard = ({ quiz, onClose, embedded = false, initialMode = 'quiz', initialAnswers = {}, onQuizCompleted }) => {
    // Mode state: 'preview' (summary), 'quiz' (active), 'review' (results)
    // If initialMode is 'review', skip straight to results.
    const [isQuizMode, setIsQuizMode] = useState(false);

    // Quiz State
    // Initialize state lazily to respect initial props on mount
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState(initialAnswers);
    const [showResults, setShowResults] = useState(initialMode === 'review');

    // Calculate initial score if in review mode
    const [score, setScore] = useState(() => {
        if (initialMode === 'review') {
            let s = 0;
            quiz.questions.forEach(q => {
                if (initialAnswers[q.id] === q.correct_answer) s++;
            });
            return s;
        }
        return 0;
    });

    // Reset state only when the quiz ID changes, NOT when unstable props like initialAnswers change
    useEffect(() => {
        // If the quiz object ref changes, we check if ID changed significantly to warrant reset
        // or if we rely on key to remount.
        // Assuming key={quiz.id} is used, this effect might strictly not be needed for reset,
        // but if key is not used or same ID is re-fetched:
        if (initialMode !== 'review') {
            // Only reset if NOT grounded in a specific review session
            setIsQuizMode(false);
            setShowResults(false);
            setUserAnswers({});
            setScore(0);
            setCurrentQuestionIndex(0);
        }
    }, [quiz.id]); // Only reset if quiz ID changes. Ignore initialMode/initialAnswers changes after mount.

    const handleStartQuiz = () => {
        setIsQuizMode(true);
        setShowResults(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setScore(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExitQuizMode = () => {
        setIsQuizMode(false);
        setShowResults(false);
        setUserAnswers({});
    };

    const handleAnswerSelect = (questionId, optionText) => {
        if (showResults) return; // Read-only in review

        const newAnswers = { ...userAnswers, [questionId]: optionText };
        setUserAnswers(newAnswers);

        // Auto-advance
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 400);
        }
    };

    const handleSubmitQuiz = async () => {
        // Calculate Score
        let newScore = 0;
        quiz.questions.forEach(q => {
            if (userAnswers[q.id] === q.correct_answer) newScore++;
        });
        setScore(newScore);
        setShowResults(true);

        // Save Attempt
        try {
            await saveAttempt(quiz.id, newScore, userAnswers);
            if (onQuizCompleted) onQuizCompleted(); // Refresh history immediately
        } catch (err) {
            console.error("Failed to save attempt", err);
        }
    };

    const handleRetake = () => {
        setShowResults(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
    };

    // Confetti on perfect score
    useEffect(() => {
        if (showResults && score === quiz.questions.length && initialMode !== 'review') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [showResults, score, quiz.questions.length, initialMode]);

    // -- RENDER: QUIZ / RESULTS MODE --
    if (isQuizMode) {
        return (
            <div className={clsx("bg-white rounded-xl shadow-xl overflow-hidden text-left flex flex-col", embedded ? "h-full" : "max-w-4xl w-full mx-auto my-8")}>
                {/* Header - Sticky */}
                <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md z-10 sticky top-0">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        {showResults ? "Quiz Results" : `Question ${currentQuestionIndex + 1}/${quiz.questions.length}`}
                    </h2>
                    <button onClick={handleExitQuizMode} className="text-indigo-200 hover:text-white text-sm bg-white/10 px-3 py-1 rounded-full transition-colors">
                        Exit
                    </button>
                </div>

                {!showResults ? (
                    // ACTIVE QUIZ INTERFACE
                    <div className="w-full bg-gray-50 flex-1 overflow-y-auto">
                        <div className="flex flex-col items-center p-6 md:p-8 min-h-[500px]">
                            {/* Progress Bar */}
                            <div className="w-full max-w-2xl mb-8">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex-1">
                                {quiz.questions[currentQuestionIndex] && (
                                    <div className="mb-6">
                                        <span className={clsx(
                                            "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3",
                                            quiz.questions[currentQuestionIndex].difficulty === 'easy' ? "bg-green-100 text-green-700" :
                                                quiz.questions[currentQuestionIndex].difficulty === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-red-100 text-red-700"
                                        )}>
                                            {quiz.questions[currentQuestionIndex].difficulty}
                                        </span>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                                            {quiz.questions[currentQuestionIndex].text}
                                        </h3>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {quiz.questions[currentQuestionIndex]?.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerSelect(quiz.questions[currentQuestionIndex].id, opt.text)}
                                            className={clsx(
                                                "w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-3 group relative overflow-hidden",
                                                userAnswers[quiz.questions[currentQuestionIndex].id] === opt.text
                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                                                    : "border-gray-100 hover:border-gray-300 bg-white text-gray-600"
                                            )}
                                        >
                                            <span className={clsx(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                                                userAnswers[quiz.questions[currentQuestionIndex].id] === opt.text
                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                    : "bg-gray-100 border-gray-200 text-gray-400 group-hover:border-gray-300 group-hover:bg-white"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between w-full max-w-2xl mt-8">
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-6 py-2 text-gray-500 hover:text-gray-900 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {currentQuestionIndex < quiz.questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitQuiz}
                                        className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold flex items-center gap-2"
                                    >
                                        Submit <CheckCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // RESULTS / REVIEW INTERFACE
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50">
                        <div className="max-w-3xl mx-auto">
                            {/* Score Card */}
                            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100 text-center">
                                <h3 className="text-gray-500 font-medium mb-2">{initialMode === 'review' ? "Historical Score" : "Your Score"}</h3>
                                <div className="text-5xl font-extrabold text-indigo-600 mb-2">
                                    {score} <span className="text-gray-300 text-3xl">/ {quiz.questions.length}</span>
                                </div>
                                <p className="text-gray-600">
                                    {score === quiz.questions.length ? "Perfect score! Outstanding!" :
                                        score > quiz.questions.length / 2 ? "Great job! Keep learning." : "Good effort! Review the answers below."}
                                </p>
                                <div className="flex justify-center gap-4 mt-6">
                                    <button onClick={handleRetake} className="px-5 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Retake Quiz
                                    </button>
                                    <button onClick={handleExitQuizMode} className="px-5 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium transition-colors">
                                        Exit
                                    </button>
                                </div>
                            </div>

                            {/* Answers List */}
                            <div className="space-y-6 pb-12">
                                {quiz.questions.map((q, idx) => {
                                    const userAnswer = userAnswers[q.id];
                                    const isCorrect = userAnswer === q.correct_answer;
                                    const isUnanswered = !userAnswer;

                                    return (
                                        <div key={idx} className={clsx("bg-white rounded-xl p-6 border shadow-sm transition-all", isCorrect ? "border-green-100 hover:border-green-200" : "border-red-100 hover:border-red-200")}>
                                            <div className="flex gap-3 mb-4">
                                                <div className="mt-1 flex-shrink-0">
                                                    {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 text-lg mb-2">{q.text}</h4>
                                                    <div className="text-sm space-y-1">
                                                        {isUnanswered ? (
                                                            <div className="flex items-center gap-2 text-orange-500 font-medium bg-orange-50 px-3 py-1 rounded-md w-fit">
                                                                <AlertCircle className="w-4 h-4" /> Not Answered
                                                            </div>
                                                        ) : (
                                                            <div className={clsx("font-medium px-3 py-1 rounded-md w-fit", isCorrect ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50")}>
                                                                Your Answer: {userAnswer}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pl-9 space-y-3">
                                                <div className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                                                    <span className="font-bold text-gray-700 mr-2">Correct Answer:</span>
                                                    <span className="text-green-700 font-bold">{q.correct_answer}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm flex gap-2">
                                                    <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                    <span>{q.explanation}</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // -- RENDER: PREVIEW CARD MODE (Summary etc) --
    return (
        <div className={clsx("bg-white rounded-xl shadow-xl overflow-hidden text-left", embedded ? "h-full" : "max-w-4xl w-full mx-auto my-8")}>
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative">
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                        <a href={quiz.url} target="_blank" rel="noreferrer" className="text-indigo-200 hover:text-white underline text-sm truncate block max-w-md">
                            {quiz.url}
                        </a>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    )}
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <BookOpen className="w-32 h-32" />
                </div>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Hero / Start Quiz Action */}
                <div className="bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-2">Ready to test your knowledge?</h3>
                    <p className="text-indigo-700 mb-6">This quiz contains {quiz.questions?.length || 0} questions ranging from easy to hard.</p>
                    <button
                        onClick={handleStartQuiz}
                        disabled={!quiz.questions || quiz.questions.length === 0}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Start Quiz Mode
                    </button>
                </div>

                {/* Summary Section */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Summary
                    </h3>
                    <p className="text-gray-600 leading-relaxed bg-white p-0">
                        {quiz.summary}
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Key Entities */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Entities</h3>
                        <div className="space-y-3 text-sm">
                            {quiz.key_entities?.filter(e => e.category === 'people').length ? (
                                <div className="flex gap-2 items-start">
                                    <User className="w-4 h-4 mt-1 text-blue-500" />
                                    <div className="flex flex-wrap gap-2">
                                        {quiz.key_entities.filter(e => e.category === 'people').map((e, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">{e.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            {quiz.key_entities?.filter(e => e.category === 'organizations').length ? (
                                <div className="flex gap-2 items-start">
                                    <Building className="w-4 h-4 mt-1 text-purple-500" />
                                    <div className="flex flex-wrap gap-2">
                                        {quiz.key_entities.filter(e => e.category === 'organizations').map((e, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">{e.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            {quiz.key_entities?.filter(e => e.category === 'locations').length ? (
                                <div className="flex gap-2 items-start">
                                    <MapPin className="w-4 h-4 mt-1 text-green-500" />
                                    <div className="flex flex-wrap gap-2">
                                        {quiz.key_entities.filter(e => e.category === 'locations').map((e, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">{e.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    {/* Sections & Topics */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Sections & Topics</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {quiz.sections?.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs uppercase tracking-wide font-medium">{s.name}</span>
                            ))}
                        </div>
                        {quiz.related_topics && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase">Related Topics</h4>
                                <div className="flex flex-wrap gap-2">
                                    {quiz.related_topics.map((t, i) => (
                                        <a
                                            key={i}
                                            href={`https://en.wikipedia.org/wiki/${t.topic.replace(/ /g, '_')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-sm transition-colors"
                                        >
                                            <Tag className="w-3 h-3" />
                                            {t.topic}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};
