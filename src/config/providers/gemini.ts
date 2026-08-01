import { AIProvider, AIRequest, AIResponse } from './base';
import { aiConfig } from '../env';

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string = 'gemini-2.0-flash';
  private readonly timeout: number = 30000;
  private readonly maxRetries: number = 3;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || aiConfig.geminiApiKey;
  }

  getProviderName(): string {
    return 'gemini';
  }

  isConfigured(): boolean {
    return aiConfig.isGeminiConfigured && !!this.apiKey;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in environment.');
    }

    return this.withRetry(async () => {
      return this.withTimeout(this.callGemini(request), this.timeout);
    });
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in environment.');
    }

    yield { text: 'Streaming response from Gemini...' };
  }

  private async callGemini(request: AIRequest): Promise<AIResponse> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: this.buildContents(request),
          systemInstruction: request.system ? { parts: [{ text: request.system }] } : undefined,
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  private buildContents(request: AIRequest) {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (request.history) {
      for (const h of request.history) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: request.prompt }],
    });

    return contents;
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
        setTimeout(() => reject(new Error('Gemini request timeout')), ms)
      ),
    ]);
  }
}
