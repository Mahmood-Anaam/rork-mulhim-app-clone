import { useState, useCallback } from 'react';
import { openAIService, ChatMessage } from '@/services/openAIService';
import { geminiService } from '@/services/geminiService';
import { useLanguage } from '@/context/LanguageProvider';
import { CONFIG } from '@/utils/config';

export interface UIStreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isToolResponse?: boolean;
  toolName?: 'suggestWorkout' | 'suggestMeal' | 'trackProgress' | 'adjustPlan';
  toolData?: any;
}

export const useAICoach = () => {
  const [messages, setMessages] = useState<UIStreamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: UIStreamMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are Mulhim, an expert Saudi fitness and nutrition coach.
      Current language: ${language === 'ar' ? 'Arabic' : 'English'}.

      When you suggest a workout, include a JSON block at the end of your response like this:
      TOOL:suggestWorkout:{"muscleGroup": "chest", "exercises": [{"name": "Pushups", "sets": 3, "reps": "12", "rest": 60}], "reason": "strength"}

      When you suggest a meal, include a JSON block like this:
      TOOL:suggestMeal:{"mealType": "lunch", "mealName": "Kabsa", "calories": 500, "protein": 30, "ingredients": ["rice", "chicken"], "cookingTips": "boil rice"}

      Keep your tone encouraging, professional, and culturally relevant to Saudi Arabia.`
    };

    const apiMessages: ChatMessage[] = [
      systemPrompt,
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text }
    ];

    try {
      const response = CONFIG.GEMINI_API_KEY
        ? await geminiService.chat(apiMessages)
        : await openAIService.chat(apiMessages);

      let finalContent = response;
      let toolData: any = null;
      let toolName: UIStreamMessage['toolName'] = undefined;

      // Basic tool detection
      const toolMatch = response.match(/TOOL:(suggestWorkout|suggestMeal|trackProgress|adjustPlan):({.*})/s);
      if (toolMatch) {
        toolName = toolMatch[1] as any;
        try {
          toolData = JSON.parse(toolMatch[2]);
          finalContent = response.replace(toolMatch[0], '').trim();
        } catch (e) {
          console.error('Failed to parse tool JSON', e);
        }
      }

      const assistantMsg: UIStreamMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
        toolName,
        toolData,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [language, messages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
