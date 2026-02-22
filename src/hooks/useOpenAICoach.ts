/**
 * useOpenAICoach
 *
 * Drop-in replacement for Rork's `useRorkAgent` hook.
 * Maintains an identical message-part shape so the existing coach UI works
 * without UI changes.
 *
 * Message format:
 *   { id, role: 'user'|'assistant', parts: MessagePart[] }
 *
 * MessagePart:
 *   | { type: 'text';  text: string }
 *   | { type: 'tool';  toolName: string; state: ToolPartState; output?: string }
 */

import { useRef, useState } from "react";
import { z } from "zod";
import { chatWithTools } from "@/src/services/openai";
import type { ToolDefinition, ChatMessage } from "@/src/services/openai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "output-available";

export type MessagePart =
  | { type: "text"; text: string }
  | {
      type: "tool";
      toolName: string;
      state: ToolPartState;
      output?: string;
    };

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
}

export interface CoachToolDefinition {
  description: string;
  zodSchema: z.ZodTypeAny;
  execute: (input: Record<string, unknown>) => string;
}

export interface UseOpenAICoachOptions {
  tools: Record<string, CoachToolDefinition>;
  systemPrompt?: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOpenAICoach({
  tools,
  systemPrompt,
}: UseOpenAICoachOptions) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Keep a ref to the tools so the async sendMessage always calls the latest
  // execute closures (which capture fresh React state setters each render).
  const toolsRef = useRef(tools);
  toolsRef.current = tools;

  // Maintain plain-text conversation history for the OpenAI API
  const historyRef = useRef<ChatMessage[]>([]);

  const sendMessage = async (text: string) => {
    const userMsgId = `user-${Date.now()}`;
    const userMsg: CoachMessage = {
      id: userMsgId,
      role: "user",
      parts: [{ type: "text", text }],
    };

    setMessages((prev) => [...prev, userMsg]);
    setError(null);

    // Append user turn to plain-text history
    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: text },
    ];

    // Add a placeholder assistant message so the UI shows a loading indicator
    const assistantMsgId = `assistant-${Date.now()}`;
    const placeholderMsg: CoachMessage = {
      id: assistantMsgId,
      role: "assistant",
      parts: [{ type: "tool", toolName: "__loading__", state: "input-streaming" }],
    };
    setMessages((prev) => [...prev, placeholderMsg]);

    try {
      const { text: responseText, toolCalls } = await chatWithTools({
        messages: historyRef.current,
        tools: toolsRef.current as Record<string, ToolDefinition>,
        systemPrompt,
      });

      const parts: MessagePart[] = [];

      if (responseText) {
        parts.push({ type: "text", text: responseText });
      }

      for (const tc of toolCalls) {
        // Show that the tool ran and produced output
        parts.push({
          type: "tool",
          toolName: tc.toolName,
          state: "output-available",
          output: tc.output,
        });
      }

      // Ensure there is always at least one part
      if (parts.length === 0) {
        parts.push({ type: "text", text: "" });
      }

      // Replace placeholder with actual content
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, parts } : m
        )
      );

      // Append assistant turn to plain-text history
      const assistantContent = [
        responseText,
        ...toolCalls.map((tc) => `[Tool ${tc.toolName}: ${tc.output}]`),
      ]
        .filter(Boolean)
        .join("\n");

      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: assistantContent },
      ];
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error ? err : new Error("Unknown error from OpenAI");
      setError(errorObj);

      // Remove the placeholder on error so the UI doesn't stay in a loading state
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
    }
  };

  return { messages, error, sendMessage };
}
