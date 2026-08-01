import { AIProvider, AIRequest, AIResponse } from './base';

export class MockAIProvider implements AIProvider {
  private readonly timeout: number = 500;

  getProviderName(): string {
    return 'mock';
  }

  isConfigured(): boolean {
    return true;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, this.timeout));

    return {
      text: `Mock AI response for: "${request.prompt.substring(0, 50)}${request.prompt.length > 50 ? '...' : ''}"`,
      usage: {
        inputTokens: request.prompt.length,
        outputTokens: 50,
      },
    };
  }

  async *generateStream(request: AIRequest): AsyncGenerator<AIResponse> {
    const words = `This is a mock streaming response for: "${request.prompt.substring(0, 30)}..."`.split(' ');
    
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield { text: word + ' ' };
    }
  }
}
