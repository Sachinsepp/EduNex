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
  isConfigured(): boolean;
  getProviderName(): string;
}
