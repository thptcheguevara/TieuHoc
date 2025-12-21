
import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { MessageAuthor } from '../types';
import { StudentIcon } from './icons/StudentIcon';
import { TeacherIcon } from './icons/TeacherIcon';
import { CorrectIcon } from './icons/CorrectIcon';
import { IncorrectIcon } from './icons/IncorrectIcon';

const GeminiIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm3.293 14.707a1 1 0 0 1-1.414 0L12 14.828l-1.879 1.879a1 1 0 1 1-1.414-1.414L10.172 13.5l-1.879-1.879a1 1 0 1 1 1.414-1.414L12 12.086l1.879-1.879a1 1 0 1 1 1.414 1.414L13.828 13.5l1.879 1.879a1 1 0 0 1 0 1.414zM8 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
    </svg>
);

export const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
    const { author, text, type } = message;

    const isUser = author === MessageAuthor.USER;
    const isAssistant = author === MessageAuthor.ASSISTANT;

    const wrapperClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
    
    let bubbleClasses = 'p-3 rounded-lg max-w-lg whitespace-pre-wrap break-words';
    if (isUser) {
        bubbleClasses += ' bg-blue-500 text-white';
    } else if (isAssistant) {
        if (type === 'hint') {
            bubbleClasses += ' bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700';
        } else {
            bubbleClasses += ' bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
        }
    } else { // MODEL
        bubbleClasses += ' bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
    }

    const Avatar: React.FC = () => {
        let icon: React.ReactNode;
        let bgClass: string;

        switch(author) {
            case MessageAuthor.USER:
                icon = <StudentIcon />;
                bgClass = 'bg-blue-500';
                break;
            case MessageAuthor.ASSISTANT:
                icon = <TeacherIcon />;
                bgClass = 'bg-green-500';
                break;
            case MessageAuthor.MODEL:
            default:
                icon = <GeminiIcon />;
                bgClass = 'bg-gray-600';
                break;
        }

        return (
            <div className={`w-10 h-10 ${bgClass} text-white rounded-full flex-shrink-0 flex items-center justify-center`}>
                {icon}
            </div>
        );
    }

    return (
        <div className={wrapperClasses}>
            {!isUser && <Avatar />}
            <div className={bubbleClasses}>
                <div className="flex items-center gap-2">
                    {isAssistant && type === 'correct' && <CorrectIcon />}
                    {isAssistant && type === 'incorrect' && <IncorrectIcon />}
                    <span>{text}</span>
                </div>
            </div>
            {isUser && <Avatar />}
        </div>
    );
};
