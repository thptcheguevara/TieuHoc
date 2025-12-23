
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, MessageAuthor, QuizQuestion } from './types';
import { generateQuiz } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { QuizOptions } from './components/math/QuizOptions';
import { SendIcon } from './components/icons/SendIcon';
import { QuizStatus } from './components/math/QuizStatus';
import { shuffleArray } from './utils/shuffle';
import { LoadingSpinner } from './components/LoadingSpinner';

export const MathAssistant: React.FC = () => {
    const [step, setStep] = useState('welcome'); // welcome, name, quiz, summary
    const [name, setName] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [selection, setSelection] = useState<{ selected?: string; correct?: string }>({});
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(120);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isQuizLoading]);
    
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    
    useEffect(() => {
        if (quizQuestions.length > 0 && step === 'quiz') {
            const currentQuestion = quizQuestions[currentQuestionIndex];
            if (currentQuestion?.options) {
                setShuffledOptions(shuffleArray(currentQuestion.options));
            }
        }
    }, [currentQuestionIndex, quizQuestions, step]);
    
    useEffect(() => {
        if (step === 'quiz' && !isWaiting) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [step, isWaiting, currentQuestionIndex]);

    useEffect(() => {
        setTimeLeft(120);
    }, [currentQuestionIndex]);


    const addMessage = (author: MessageAuthor, text: string, type?: ChatMessageType['type']) => {
        setMessages(prev => [...prev, { author, text, type }]);
    };

    const startNewQuiz = async () => {
        setIsQuizLoading(true);
        setQuizError(null);
        setQuizQuestions([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setCorrectAnswersCount(0);
        setIncorrectAnswers(0);
        setAttempts(0);
        setIsWaiting(false);
        setSelection({});
        setTimeLeft(120);

        try {
            const questions = await generateQuiz();
            setQuizQuestions(questions);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const userFriendlyError = `Rất tiếc, cô không thể tạo bộ đề mới ngay lúc này. Con hãy thử lại sau nhé! (Lỗi: ${errorMessage})`;
            setQuizError(userFriendlyError);
            addMessage(MessageAuthor.ASSISTANT, userFriendlyError, 'incorrect');
            return false;
        } finally {
            setIsQuizLoading(false);
        }
    };

    useEffect(() => {
        addMessage(MessageAuthor.ASSISTANT, "Tối nay, cả lớp hãy tham gia thử thách '10 cửa ải toán học' với trợ lý Gemini. Mỗi câu hỏi được +10 điểm/câu, nếu trả lời sai cho phép làm lại 1 lần duy nhất, nếu làm lại đúng chỉ được +5 điểm. Bạn nào đạt được 100/100 điểm hãy chụp màn hình gửi cô nhé!");
    }, []);

    const handleStart = () => {
        addMessage(MessageAuthor.ASSISTANT, 'Trước tiên, cho cô biết tên của con là gì nào? 😊');
        setStep('name');
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isQuizLoading) {
            setName(inputValue);
            addMessage(MessageAuthor.USER, inputValue);
            addMessage(MessageAuthor.ASSISTANT, `Tuyệt vời, ${inputValue}! Cô đang tạo bộ đề cho con đây, chờ một chút nhé... ⏳`);
            setInputValue('');
            const success = await startNewQuiz();
            if (success) {
                addMessage(MessageAuthor.ASSISTANT, `Bộ đề đã sẵn sàng! Chúng ta cùng bắt đầu với câu hỏi đầu tiên nhé! ⭐`);
                setStep('quiz');
            }
        }
    };
    
    const showSummary = (finalScore: number) => {
        setStep('summary');
        let title = "Cần cố gắng hơn xíu nữa nha 💪";
        if (finalScore >= 90) title = "Thần đồng Toán học! 🏆";
        else if (finalScore >= 60) title = "Chiến binh chăm chỉ! 🏅";

        addMessage(MessageAuthor.ASSISTANT, `🎉 Chúc mừng ${name} đã hoàn thành thử thách! 🎉\n\nTổng điểm của con là: ${finalScore}/100\nDanh hiệu của con: ${title}\n\nCon làm rất tốt! Hãy luôn giữ vững tinh thần học hỏi này nhé!`, 'summary');
    };
    
    const nextQuestion = () => {
        setAttempts(0);
        setSelection({});
        setIsWaiting(false);
        setCurrentQuestionIndex(prev => prev + 1);
    };
    
    const handleTimeout = () => {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        if (!currentQuestion) return;

        setIsWaiting(true);
        setIncorrectAnswers(prev => prev + 1);
        setSelection({ selected: '', correct: currentQuestion.correctAnswer });
        addMessage(MessageAuthor.ASSISTANT, `Hết giờ rồi! Đáp án đúng là "${currentQuestion.correctAnswer}".\n\nChúng ta qua câu tiếp theo nhé!`, 'incorrect');
        
        const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
        if (isLastQuestion) {
            timeoutRef.current = window.setTimeout(() => showSummary(score), 5000);
        } else {
            timeoutRef.current = window.setTimeout(nextQuestion, 5000);
        }
    };

    const handleAnswer = (option: string) => {
        if (isWaiting) return;
        setIsWaiting(true);
        const currentQuestion = quizQuestions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.correctAnswer;
        setSelection({ selected: option, correct: currentQuestion.correctAnswer });
        const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

        if (isCorrect) {
            const points = attempts === 0 ? 10 : 5;
            const newScore = score + points;
            setScore(newScore);
            setCorrectAnswersCount(c => c + 1);
            addMessage(MessageAuthor.ASSISTANT, `Tuyệt vời! Chính xác rồi, con được cộng ${points} điểm!`, 'correct');
            
            if (isLastQuestion) {
                timeoutRef.current = window.setTimeout(() => showSummary(newScore), 5000);
            } else {
                timeoutRef.current = window.setTimeout(nextQuestion, 5000);
            }
        } else {
            if (attempts === 0) {
                setIncorrectAnswers(prev => prev + 1);
                addMessage(MessageAuthor.ASSISTANT, `Xem lại nhé, chưa đúng rồi. Gợi ý của cô là:\n\n${currentQuestion.hint}\n\nCon hãy thử lại một lần nữa xem nào!`, 'hint');
                setAttempts(1);
                setIsWaiting(false);
            } else {
                addMessage(MessageAuthor.ASSISTANT, `Rất tiếc vẫn chưa đúng.\n\nĐáp án đúng là "${currentQuestion.correctAnswer}". ${currentQuestion.explanation}\n\nĐừng lo, chúng ta qua câu tiếp theo nhé!`, 'incorrect');
                if (isLastQuestion) {
                    timeoutRef.current = window.setTimeout(() => showSummary(score), 5000);
                } else {
                    timeoutRef.current = window.setTimeout(nextQuestion, 5000);
                }
            }
        }
    };

    const handleRestart = () => {
        setStep('welcome');
        setName('');
        setInputValue('');
        setMessages([]);
        addMessage(MessageAuthor.ASSISTANT, "Tối nay, cả lớp hãy tham gia thử thách '10 cửa ải toán học' với trợ lý Gemini. Mỗi câu hỏi được +10 điểm/câu, nếu trả lời sai cho phép làm lại 1 lần duy nhất, nếu làm lại đúng chỉ được +5 điểm. Bạn nào đạt được 100/100 điểm hãy chụp màn hình gửi cô nhé!");
        setQuizQuestions([]);
    };

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <div className="flex flex-col h-full">
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isQuizLoading && (
                         <div className="flex justify-start">
                            <div className="flex items-center gap-2 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                <LoadingSpinner />
                            </div>
                         </div>
                    )}
                    {step === 'quiz' && currentQuestion && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                             <QuizStatus 
                                current={currentQuestionIndex + 1}
                                total={quizQuestions.length}
                                correct={correctAnswersCount}
                                incorrect={incorrectAnswers}
                                timeLeft={timeLeft}
                             />
                             <div>
                                <p className="font-bold mb-3 text-gray-800 dark:text-gray-200">Câu {currentQuestionIndex + 1}: {currentQuestion.question}</p>
                                <QuizOptions 
                                    options={shuffledOptions}
                                    onSelect={handleAnswer}
                                    disabled={isWaiting}
                                    selection={selection}
                                />
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-3xl mx-auto">
                    {quizError && step !== 'quiz' && <p className="text-red-500 text-center mb-2">{quizError}</p>}
                    {step === 'welcome' && (
                        <button onClick={handleStart} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            Bắt đầu
                        </button>
                    )}
                    {step === 'name' && (
                         <form onSubmit={handleNameSubmit} className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Tên của con là..."
                                disabled={isQuizLoading}
                                className="w-full p-3 pr-14 border-2 border-purple-300 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-200 dark:bg-gray-700 dark:border-purple-500 dark:focus:ring-purple-400/50 transition-all text-gray-800 dark:text-gray-100 disabled:bg-gray-200"
                            />
                            <button
                                type="submit"
                                aria-label="Gửi tên"
                                disabled={!inputValue.trim() || isQuizLoading}
                                className="absolute top-1/2 right-2 -translate-y-1/2 bg-purple-500 text-white rounded-full p-2.5 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-purple-300 transition-colors"
                            >
                               <SendIcon />
                            </button>
                        </form>
                    )}
                     {step === 'summary' && (
                        <button onClick={handleRestart} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">
                            Chơi lại
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};
