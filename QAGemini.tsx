
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from './types';
import { MessageAuthor } from './types';
import { askGemini } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { LoadingSpinner } from './components/LoadingSpinner';

export const QAGemini: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessageType = { author: MessageAuthor.USER, text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await askGemini(text);
      const modelMessage: ChatMessageType = { author: MessageAuthor.MODEL, text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response from Gemini. ${errorMessage}`);
      const errorResponseMessage: ChatMessageType = {
        author: MessageAuthor.MODEL,
        text: `Sorry, I encountered an error. Please try again. (${errorMessage})`,
      };
      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
        <main className="flex-grow p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
                <div className="flex justify-start items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-lg">
                        <LoadingSpinner />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>
        </main>

        <footer className="bg-white dark:bg-gray-800 p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-3xl mx-auto">
            {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
            <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </footer>
    </div>
  );
};
