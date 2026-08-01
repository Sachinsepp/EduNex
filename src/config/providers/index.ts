import { AIProvider } from './base';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { MockAIProvider } from './mock';
import { aiConfig, validateAIConfig, AIProviderType } from '../env';

let cachedProvider: AIProvider | null = null;

export function createAIProvider(type?: AIProviderType): AIProvider {
  const providerType = type || aiConfig.provider;

  const validation = validateAIConfig();
  if (!validation.valid && providerType !== 'mock') {
    console.warn(`AI Provider warning: ${validation.error}. Falling back to mock provider.`);
    return new MockAIProvider();
  }

  switch (providerType) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'mock':
    default:
      return new MockAIProvider();
  }
}

export function initializeAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider = createAIProvider();
  return cachedProvider;
}

export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    return initializeAIProvider();
  }
  return cachedProvider;
}

export function resetAIProvider(): void {
  cachedProvider = null;
}

export { AIProvider } from './base';
export type { AIRequest, AIResponse } from './base';
export { GeminiProvider } from './gemini';
export { OpenAIProvider } from './openai';
export { MockAIProvider } from './mock';
