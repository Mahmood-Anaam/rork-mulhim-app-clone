import { CONFIG } from '@/utils/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const geminiService = {
  async chat(messages: ChatMessage[]) {
    if (!CONFIG.GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing');
    }

    try {
      const cleanKey = CONFIG.GEMINI_API_KEY.trim().replace(/^['"]|['"]$/g, '');

      // Convert messages to Gemini format
      // Gemini expects system instruction separately or as a specific role if using newer models
      // For simplicity, we'll prepend the system message if it exists

      let prompt = "";
      const systemMessage = messages.find(m => m.role === 'system');
      if (systemMessage) {
        prompt += `System Instruction: ${systemMessage.content}\n\n`;
      }

      const chatHistory = messages.filter(m => m.role !== 'system');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: chatHistory.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          system_instruction: systemMessage ? {
             parts: [{ text: systemMessage.content }]
          } : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[GeminiService] Gemini Error response:', errorData);
        throw new Error(errorData.error?.message || `Gemini API error (${response.status})`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('[GeminiService] Chat error:', error);
      throw error;
    }
  },

  async generateStructuredData<T>(prompt: string, schema: any): Promise<T> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a helpful assistant that returns ONLY valid JSON based on the following schema: ${JSON.stringify(schema)}`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const content = await this.chat(messages);
    try {
      // Clean potential markdown code blocks from response
      const jsonStr = content.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr) as T;
    } catch (error) {
      console.error('[GeminiService] JSON Parse error:', error, 'Content:', content);
      throw new Error('Failed to parse structured response from AI');
    }
  }
};
