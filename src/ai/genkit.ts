import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { aiConfig } from '../config/env';

let aiInstance: ReturnType<typeof genkit> | null = null;

export function getAIInstance() {
  if (!aiInstance) {
    const plugins = [];

    if (aiConfig.isGeminiConfigured) {
      plugins.push(googleAI({ apiVersion: 'v1beta' }));
    }

    aiInstance = genkit({
      plugins,
      model: aiConfig.isGeminiConfigured ? 'googleai/gemini-2.0-flash' : 'dummy/model',
    });
  }

  return aiInstance;
}

export const ai = getAIInstance();
