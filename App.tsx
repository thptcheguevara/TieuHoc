
import React, { useState } from 'react';
import { MathAssistant } from './MathAssistant';
import { QAGemini } from './QAGemini';

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<'math' | 'qa'>('math');

  const getButtonClasses = (app: 'math' | 'qa') => {
    return `px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
      activeApp === app
        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md p-2 flex justify-center items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <button onClick={() => setActiveApp('math')} className={getButtonClasses('math')}>
            Trợ lý Toán học
          </button>
          <button onClick={() => setActiveApp('qa')} className={getButtonClasses('qa')}>
            Gemini
          </button>
        </div>
      </header>
      <div className="flex-grow overflow-hidden">
        {activeApp === 'math' ? <MathAssistant /> : <QAGemini />}
      </div>
    </div>
  );
};

export default App;
