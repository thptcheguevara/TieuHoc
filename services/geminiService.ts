
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// QUAN TRỌNG: Hãy thay thế "YOUR_API_KEY_HERE" bằng khóa API Google Gemini của bạn.
// Bạn có thể lấy khóa tại https://aistudio.google.com/app/apikey
const API_KEY = "AIzaSyDG3rpi7YMU6NYlaITynYl7Qfdwa8RSwys";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const checkApiKey = () => {
    if (API_KEY === "YOUR_API_KEY_HERE") {
        throw new Error("Vui lòng thay thế 'YOUR_API_KEY_HERE' bằng API key của bạn trong tệp services/geminiService.ts");
    }
}

export const askGemini = async (prompt: string): Promise<string> => {
  checkApiKey();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (text) {
        return text;
    } else {
        throw new Error("Received an empty response from Gemini API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

export const generateQuiz = async (): Promise<QuizQuestion[]> => {
    checkApiKey();
    try {
        const prompt = `Hãy tạo một bài kiểm tra trắc nghiệm gồm 10 câu hỏi toán học cho học sinh lớp 4 ở Việt Nam.
Các câu hỏi nên bao gồm các chủ đề sau: đọc và viết số lớn, giá trị của chữ số theo hàng và lớp, so sánh và sắp xếp số, làm tròn số, dãy số có quy luật, và các phép tính cơ bản (cộng, trừ, nhân, chia) với số tự nhiên.
QUAN TRỌNG: KHÔNG BAO GỒM các bài toán nhân một số có hai chữ số với một số có hai chữ số.
Mỗi câu hỏi phải có:
1.  "question": Nội dung câu hỏi.
2.  "options": Một mảng gồm 4 chuỗi đáp án.
3.  "correctAnswer": Chuỗi đáp án đúng (phải khớp chính xác với một trong các tùy chọn).
4.  "hint": Một gợi ý ngắn gọn.
5.  "explanation": Lời giải thích rõ ràng cho đáp án đúng.

Vui lòng trả lời dưới dạng một mảng JSON tuân thủ theo schema đã cung cấp.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            correctAnswer: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswer", "hint", "explanation"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);

        if (!Array.isArray(quizData) || quizData.length === 0) {
            throw new Error("API returned invalid quiz data.");
        }
        
        return quizData;

    } catch (error) {
        console.error("Error generating quiz from Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the quiz.");
    }
};
