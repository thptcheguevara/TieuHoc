
import React from 'react';
import { StatusCorrectIcon } from '../icons/StatusCorrectIcon';
import { StatusIncorrectIcon } from '../icons/StatusIncorrectIcon';
import { TimerIcon } from '../icons/TimerIcon';

interface QuizStatusProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
  timeLeft: number;
}

export const QuizStatus: React.FC<QuizStatusProps> = ({ current, total, correct, incorrect, timeLeft }) => {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <div className="space-y-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">
        <span>Tiến độ</span>
        <span>Câu {current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}>
        </div>
      </div>
      <div className="flex justify-around items-center text-center">
        <div className="flex items-center gap-2">
            <StatusCorrectIcon />
            <div>
                <div className="font-bold text-lg text-green-600 dark:text-green-400">{correct}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Đúng</div>
            </div>
        </div>
         <div className="flex items-center gap-2">
            <TimerIcon />
            <div>
                <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Thời gian</div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <StatusIncorrectIcon />
            <div>
                <div className="font-bold text-lg text-red-600 dark:text-red-400">{incorrect}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Sai</div>
            </div>
        </div>
      </div>
    </div>
  );
};
