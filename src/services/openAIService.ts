import { CONFIG } from '@/utils/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const openAIService = {
  async chat(messages: ChatMessage[]) {
    if (!CONFIG.OPENAI_API_KEY) {
      throw new Error('OpenAI API Key is missing');
    }

    try {
      const cleanKey = CONFIG.OPENAI_API_KEY.trim().replace(/^['"]|['"]$/g, '');
      console.log('[OpenAIService] Sending request to OpenAI...', {
        model: 'gpt-4o',
        messageCount: messages.length,
        hasKey: !!cleanKey,
        keyStart: cleanKey.substring(0, 7),
        keyEnd: cleanKey.substring(cleanKey.length - 4)
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[OpenAIService] OpenAI Error response:', errorData);
        throw new Error(errorData.error?.message || `OpenAI API error (${response.status})`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('[OpenAIService] Chat error:', error);
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
      console.error('[OpenAIService] JSON Parse error:', error, 'Content:', content);
      throw new Error('Failed to parse structured response from AI');
    }
  }
};
