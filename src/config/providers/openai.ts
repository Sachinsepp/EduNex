import { AIProvider, AIRequest, AIResponse } from './base';
import { aiConfig } from '../env';

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string = 'gpt-4o-mini';
  private readonly timeout: number = 30000;
  private readonly maxRetries: number = 3;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || aiConfig.openaiApiKey;
  }

  getProviderName(): string {
    return 'openai';
  }

  isConfigured(): boolean {
    return aiConfig.isOpenAIConfigured && !!this.apiKey;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment.');
    }

    return this.withRetry(async () => {
      return this.withTimeout(this.callOpenAI(request), this.timeout);
    });
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment.');
    }

    yield { text: 'Streaming response from OpenAI...' };
  }

  private async callOpenAI(request: AIRequest): Promise<AIResponse> {
    const messages: Array<{ role: string; content: string }> = [];

    if (request.system) {
      messages.push({ role: 'system', content: request.system });
    }

    if (request.history) {
      for (const h of request.history) {
        messages.push({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.content,
        });
      }
    }

    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      text: data.choices?.[0]?.message?.content || '',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI request timeout')), ms)
      ),
    ]);
  }
}
