
export enum MessageAuthor {
  USER = 'user',
  MODEL = 'model',
  ASSISTANT = 'assistant',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  type?: 'hint' | 'correct' | 'incorrect' | 'summary';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}
