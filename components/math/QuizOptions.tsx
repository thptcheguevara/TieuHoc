
import React from 'react';

interface QuizOptionsProps {
  options: string[];
  onSelect: (optionText: string) => void;
  disabled: boolean;
  selection: { selected?: string; correct?: string };
}

export const QuizOptions: React.FC<QuizOptionsProps> = ({ options, onSelect, disabled, selection }) => {
    
    const getButtonClasses = (optionValue: string) => {
        const baseClasses = "w-full text-left p-3 my-1 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:scale-105";
        
        if (selection.selected && selection.selected === optionValue) { // User clicked this button
            return selection.correct === optionValue
                ? `${baseClasses} bg-green-500 border-green-700 text-white font-bold` // Correct choice
                : `${baseClasses} bg-red-500 border-red-700 text-white font-bold`; // Incorrect choice
        }

        if (disabled && selection.correct === optionValue) { // Show correct answer after wrong 2nd attempt
             return `${baseClasses} bg-green-500 border-green-700 text-white font-bold`;
        }

        return `${baseClasses} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((value, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(value)}
                    disabled={disabled}
                    className={getButtonClasses(value)}
                >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {value}
                </button>
            ))}
        </div>
    );
};
