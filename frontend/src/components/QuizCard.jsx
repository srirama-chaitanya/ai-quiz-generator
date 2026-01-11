import React, { useState } from 'react';
import { CheckCircle, XCircle, BookOpen, User, Building, MapPin, Tag, Play, Award, RotateCcw, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const QuizCard = ({ quiz, onClose, embedded = false }) => {
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [userAnswers, setUserAnswers] = useState({}); // { questionId: optionText }
    const [showResults, setShowResults] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleStartQuiz = () => {
        setIsQuizMode(true);
        setShowResults(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
    };

    const handleAnswerSelect = (questionId, optionText) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionText
        }));

        // Auto-advance or Auto-submit
        setTimeout(() => {
            if (currentQuestionIndex < quiz.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                handleSubmitQuiz();
            }
        }, 700);
    };

    const handleSubmitQuiz = () => {
        setShowResults(true);
        // Defer score calculation to render cycle or recalculate
        // We need to use the state, but inside handleAnswerSelect set state might not be flushed yet if we called this immediately. 
        // But since we use setTimeout 700ms, state should be updated.
        // Let's rely on the userAnswers state which should be updated.
        // Actually, we need to calculate score inside render or use a fresh calculation.
        // The calculateScore function uses userAnswers which is state.

        // Trigger confetti if perfect score
        // We need to calculate score based on the *latest* update. 
        // Since we are inside a timeout, userAnswers *might* be stale if we closed over it? 
        // No, userAnswers in the component scope will be stale in the closure of the render where handleAnswerSelect was defined.
        // We should move confetti logic to a useEffect or recalculate explicitly.
        // For simplicity, I will just set showResults(true) and let the effect handle it or just run it. 
        // Ideally we check score in useEffect when showResults becomes true.
    };

    // Watch for results to trigger confetti
    React.useEffect(() => {
        if (showResults) {
            const score = quiz.questions.reduce((acc, q) => {
                return acc + (userAnswers[q.id] === q.correct_answer ? 1 : 0);
            }, 0);

            if (score === quiz.questions.length) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    }, [showResults, quiz, userAnswers]);

    const calculateScore = () => {
        let score = 0;
        quiz.questions.forEach(q => {
            if (userAnswers[q.id] === q.correct_answer) {
                score++;
            }
        });
        return score;
    };

    const handleRetake = () => {
        setShowResults(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
    };

    const handleExitQuizMode = () => {
        setIsQuizMode(false);
        setShowResults(false);
        setUserAnswers({});
    };

    if (isQuizMode) {
        return (
            <div className={clsx("bg-white rounded-xl shadow-xl overflow-hidden text-left flex flex-col", embedded ? "h-full" : "max-w-4xl w-full mx-auto my-8")}>
                {/* Header - Sticky */}
                <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md z-10 sticky top-0">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Quiz Mode: {quiz.title}
                    </h2>
                    <button onClick={handleExitQuizMode} className="text-indigo-200 hover:text-white text-sm">
                        Exit
                    </button>
                </div>

                {!showResults ? (
                    <div className="w-full bg-gray-50 pb-12">
                        <div className="flex flex-col items-center p-6 md:p-8">
                            {/* Progress Bar */}
                            <div className="w-full max-w-2xl mb-8">
                                <div className="flex justify-between text-sm text-gray-500 mb-2">
                                    <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                                    <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
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

                                <div className="space-y-3">
                                    {quiz.questions[currentQuestionIndex].options.map((opt, idx) => (
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
                                        // disabled={!userAnswers[quiz.questions[currentQuestionIndex].id]} // Optional: force answer
                                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitQuiz}
                                        className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold flex items-center gap-2"
                                    >
                                        Submit Quiz <Award className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50">
                        {/* Results View */}
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100 text-center">
                                <h3 className="text-gray-500 font-medium mb-2">Your Score</h3>
                                <div className="text-5xl font-extrabold text-indigo-600 mb-2">
                                    {calculateScore()} <span className="text-gray-300 text-3xl">/ {quiz.questions.length}</span>
                                </div>
                                <p className="text-gray-600">
                                    {calculateScore() === quiz.questions.length ? "Perfect score! Outstanding!" :
                                        calculateScore() > quiz.questions.length / 2 ? "Great job! Keep learning." : "Good effort! Review the answers below."}
                                </p>
                                <div className="flex justify-center gap-4 mt-6">
                                    <button onClick={handleRetake} className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Retake Quiz
                                    </button>
                                    <button onClick={handleExitQuizMode} className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-medium transition-colors">
                                        Exit to Review
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {quiz.questions.map((q, idx) => {
                                    const userAnswer = userAnswers[q.id];
                                    const isCorrect = userAnswer === q.correct_answer;
                                    // If unattempted, treat as incorrect
                                    const isUnanswered = !userAnswer;

                                    return (
                                        <div key={idx} className={clsx("bg-white rounded-xl p-6 border shadow-sm", isCorrect ? "border-green-100" : "border-red-100")}>
                                            <div className="flex gap-3 mb-4">
                                                <div className="mt-1">
                                                    {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{q.text}</h4>
                                                    <div className="text-sm">
                                                        {isUnanswered ? (
                                                            <span className="text-orange-500 font-medium">Not Answered</span>
                                                        ) : (
                                                            <span className={isCorrect ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                                                                Your Answer: {userAnswer}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pl-9 space-y-2">
                                                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                                    <span className="font-bold text-gray-700 mr-2">Correct Answer:</span>
                                                    <span className="text-green-700 font-medium">{q.correct_answer}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm italic">
                                                    <span className="font-medium mr-1">Explanation:</span>
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )
                }
            </div >
        );
    }

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
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
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
