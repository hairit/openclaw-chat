interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const GATEWAY_URL = import.meta.env.VITE_OPENCLAW_GATEWAY_URL;
const GATEWAY_TOKEN = "openclaw-chat";
const MODEL = import.meta.env.VITE_OPENCLAW_MODEL;

if (!GATEWAY_URL || !GATEWAY_TOKEN || !MODEL) {
  console.warn("OpenClaw environment variables are not fully configured");
}

export async function sendMessage(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const messages: Message[] = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const request: ChatCompletionRequest = {
    model: MODEL || "openclaw/default",
    messages,
  };

  try {
    const response = await fetch(
      `${GATEWAY_URL || "http://127.0.0.1:18789"}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GATEWAY_TOKEN}`,
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();
    const assistantMessage =
      data.choices[0]?.message?.content || "No response received";
    return assistantMessage;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get response";
    throw new Error(`OpenClaw API Error: ${errorMessage}`);
  }
}
