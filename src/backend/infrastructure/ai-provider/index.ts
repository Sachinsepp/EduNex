import { logger } from '../../core/logger';
import { config, aiConfig, validateAIConfig } from '../../config';
import { ExternalServiceError } from '../../core/errors/app-errors';
import { cache } from '../cache';

export interface AIRequest {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
}

export interface AIResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
  generateStream?(request: AIRequest): AsyncGenerator<AIResponse>;
}

abstract class BaseAIProvider implements AIProvider {
  protected apiKey?: string;
  protected model: string = 'default';
  protected timeout: number = 30000;
  protected maxRetries: number = 3;

  abstract generate(request: AIRequest): Promise<AIResponse>;
  abstract generateStream?(request: AIRequest): AsyncGenerator<AIResponse>;

  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`AI request failed (attempt ${attempt}/${this.maxRetries})`, {
          error: lastError.message,
        });
        
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  protected withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), ms)
      ),
    ]);
  }
}

class GoogleAIProvider extends BaseAIProvider {
  private client: unknown = null;

  constructor() {
    super();
    this.apiKey = aiConfig.geminiApiKey;
    this.model = 'gemini-2.0-flash';
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new ExternalServiceError('Gemini', 'API key not configured. Set GEMINI_API_KEY in environment.');
    }

    const cacheKey = `ai:${request.prompt.substring(0, 50)}`;
    
    const cached = await cache.get<AIResponse>(cacheKey);
    if (cached) {
      logger.debug('AI response cached');
      return cached;
    }

    logger.info('Calling Google AI', { model: this.model, promptLength: request.prompt.length });

    try {
      const response = await this.withRetry(async () => {
        return this.withTimeout(this.callAI(request), this.timeout);
      });

      await cache.set(cacheKey, response, { ttl: 3600 });
      
      return response;
    } catch (error) {
      const err = error as Error;
      logger.error('Google AI request failed', { error: err.message });
      throw new ExternalServiceError('Google AI', err.message);
    }
  }

  private async callAI(request: AIRequest): Promise<AIResponse> {
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

  async *generateStream(request: AIRequest): AsyncGenerator<AIResponse> {
    logger.info('Calling Google AI stream', { model: this.model });
    yield { text: 'Streaming response...' };
  }

  isConfigured(): boolean {
    return aiConfig.isGeminiConfigured;
  }
}

class MockAIProvider extends BaseAIProvider {
  async generate(request: AIRequest): Promise<AIResponse> {
    logger.info('Mock AI generate', { prompt: request.prompt.substring(0, 50) });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      text: `Mock AI response for: ${request.prompt.substring(0, 30)}...`,
      usage: {
        inputTokens: request.prompt.length,
        outputTokens: 50,
      },
    };
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIResponse> {
    logger.info('Mock AI stream', { prompt: request.prompt });
    
    const words = 'This is a mock streaming response from the AI provider.'.split(' ');
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield { text: word + ' ' };
    }
  }

  isConfigured(): boolean {
    return true;
  }
}

let aiProvider: AIProvider | null = null;

export function initializeAIProvider(): AIProvider {
  logger.info('Initializing AI provider', { 
    provider: aiConfig.provider,
    hasGeminiKey: aiConfig.isGeminiConfigured,
    hasOpenAIKey: aiConfig.isOpenAIConfigured,
  });
  
  const validation = validateAIConfig();
  if (!validation.valid) {
    logger.warn(`AI config validation failed: ${validation.error}. Using mock provider.`);
    aiProvider = new MockAIProvider();
  } else if (aiConfig.provider === 'gemini' && aiConfig.isGeminiConfigured) {
    logger.info('Using Google AI provider');
    aiProvider = new GoogleAIProvider();
  } else {
    logger.info('Using mock AI provider');
    aiProvider = new MockAIProvider();
  }

  return aiProvider;
}

export function getAIProvider(): AIProvider {
  if (!aiProvider) {
    throw new Error('AI provider not initialized. Call initializeAIProvider first.');
  }
  return aiProvider;
}

export const ai = {
  generate: async (request: AIRequest): Promise<AIResponse> => {
    return getAIProvider().generate(request);
  },
  generateStream: async function* (request: AIRequest): AsyncGenerator<AIResponse> {
    const provider = getAIProvider();
    if (!provider.generateStream) {
      throw new Error('Streaming not supported by this provider');
    }
    yield* provider.generateStream(request);
  },
};
