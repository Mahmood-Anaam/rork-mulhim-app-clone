/**
 * Lightweight OpenAI client utilities.
 *
 * Uses the OpenAI REST API directly so we stay dependency-free
 * (no openai npm package needed in the RN bundle).
 */

import { z } from "zod";
import { config } from "@/src/utils/config";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Minimal recursive Zod → JSON Schema converter (covers all types used in the app). */
export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // Use _def.typeName for Zod v3/v4 compatibility (avoids instanceof issues with dual packages)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = (schema as any)._def;
  const typeName: string = def?.typeName ?? "";

  switch (typeName) {
    case "ZodObject": {
      const shape: Record<string, z.ZodTypeAny> = def.shape?.() ?? def.shape ?? {};
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const fieldSchema = value as z.ZodTypeAny;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldDef = (fieldSchema as any)._def;
        const isOptional = fieldDef?.typeName === "ZodOptional";
        const inner = isOptional ? fieldDef.innerType : fieldSchema;
        const jsonField = zodToJsonSchema(inner as z.ZodTypeAny);

        const description: string | undefined = fieldDef?.description;
        properties[key] = description ? { ...jsonField, description } : jsonField;

        if (!isOptional) required.push(key);
      }

      return { type: "object", properties, required };
    }

    case "ZodString": {
      const result: Record<string, unknown> = { type: "string" };
      if (def.description) result.description = def.description;
      return result;
    }

    case "ZodNumber": {
      const result: Record<string, unknown> = { type: "number" };
      if (def.description) result.description = def.description;
      return result;
    }

    case "ZodBoolean":
      return { type: "boolean" };

    case "ZodEnum": {
      // Zod v3: options is string[]. Zod v4: entries is Record<string, string>.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enumOptions: string[] = Array.isArray(def.options)
        ? def.options
        : Object.values(def.entries ?? {});
      return { type: "string", enum: enumOptions };
    }

    case "ZodArray": {
      const itemType = def.type ?? def.element;
      return { type: "array", items: zodToJsonSchema(itemType as z.ZodTypeAny) };
    }

    case "ZodOptional": {
      return zodToJsonSchema(def.innerType as z.ZodTypeAny);
    }

    default:
      return {};
  }
}

// ---------------------------------------------------------------------------
// generateObject — structured JSON generation via OpenAI
// ---------------------------------------------------------------------------

export interface GenerateObjectOptions<S extends z.ZodTypeAny> {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  schema: S;
  model?: string;
}

/**
 * Calls the OpenAI Chat Completions API with `response_format: json_object`,
 * then parses and validates the response against the provided Zod schema.
 */
export async function generateObject<S extends z.ZodTypeAny>({
  messages,
  schema,
  model = DEFAULT_MODEL,
}: GenerateObjectOptions<S>): Promise<z.infer<S>> {
  const apiKey = config.openaiApiKey;
  if (!apiKey) throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");

  const systemMsg = {
    role: "system" as const,
    content:
      "Respond ONLY with a valid JSON object that exactly matches the requested schema. Do not include any explanatory text outside the JSON.",
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [systemMsg, ...messages],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);
  return schema.parse(parsed) as z.infer<S>;
}

// ---------------------------------------------------------------------------
// chatWithTools — multi-turn chat with function-calling support
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  description: string;
  zodSchema: z.ZodTypeAny;
  execute: (input: Record<string, unknown>) => string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ToolCallResult {
  toolName: string;
  input: Record<string, unknown>;
  output: string;
}

export interface ChatWithToolsResult {
  text: string;
  toolCalls: ToolCallResult[];
}

/**
 * Single-shot chat call that supports OpenAI function/tool calling.
 * Returns the assistant text and any executed tool results.
 */
export async function chatWithTools({
  messages,
  tools,
  systemPrompt,
  model = DEFAULT_MODEL,
}: {
  messages: ChatMessage[];
  tools: Record<string, ToolDefinition>;
  systemPrompt?: string;
  model?: string;
}): Promise<ChatWithToolsResult> {
  const apiKey = config.openaiApiKey;
  if (!apiKey) throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");

  const systemMessages: ChatMessage[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }]
    : [];

  const openAITools = Object.entries(tools).map(([name, def]) => ({
    type: "function" as const,
    function: {
      name,
      description: def.description,
      parameters: zodToJsonSchema(def.zodSchema),
    },
  }));

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [...systemMessages, ...messages],
      tools: openAITools,
      tool_choice: "auto",
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const aiMsg = data.choices?.[0]?.message;
  const text: string = aiMsg?.content ?? "";
  const toolCalls: ToolCallResult[] = [];

  if (Array.isArray(aiMsg?.tool_calls)) {
    for (const tc of aiMsg.tool_calls) {
      const toolName: string = tc.function?.name ?? "";
      let input: Record<string, unknown> = {};
      try {
        input = JSON.parse(tc.function?.arguments ?? "{}");
      } catch {
        // malformed JSON — skip
      }
      const def = tools[toolName];
      const output = def ? def.execute(input) : "";
      toolCalls.push({ toolName, input, output });
    }
  }

  return { text, toolCalls };
}
