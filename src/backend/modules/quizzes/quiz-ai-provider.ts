import { logger } from '../../core/logger';
import { ExternalServiceError, ValidationError } from '../../core/errors/app-errors';
import { QuizQuestion } from './quiz.types';
import { aiConfig } from '../../config';

export interface AIQuizGeneratorInput {
  topic: string;
  numberOfQuestions: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AIQuizGenerator {
  generateQuiz(input: AIQuizGeneratorInput): Promise<QuizQuestion[]>;
}

export class AIQuizGeneratorImpl implements AIQuizGenerator {
  private timeout: number = 30000;
  private maxRetries: number = 3;

  async generateQuiz(input: AIQuizGeneratorInput): Promise<QuizQuestion[]> {
    this.validateInput(input);

    logger.info('Generating quiz', { 
      topic: input.topic, 
      numberOfQuestions: input.numberOfQuestions,
      difficulty: input.difficulty || 'medium'
    });

    try {
      const questions = await this.withRetry(async () => {
        return this.withTimeout(this.callAIProvider(input), this.timeout);
      });

      logger.info('Quiz generated successfully', { 
        topic: input.topic, 
        questionCount: questions.length 
      });

      return questions;
    } catch (error) {
      const err = error as Error;
      logger.error('Quiz generation failed', { 
        topic: input.topic, 
        error: err.message 
      });
      throw new ExternalServiceError('AI Quiz Generator', err.message);
    }
  }

  private validateInput(input: AIQuizGeneratorInput): void {
    if (!input.topic || input.topic.trim().length === 0) {
      throw new ValidationError('Topic is required');
    }
    if (input.numberOfQuestions < 1 || input.numberOfQuestions > 20) {
      throw new ValidationError('Number of questions must be between 1 and 20');
    }
  }

  private async callAIProvider(input: AIQuizGeneratorInput): Promise<QuizQuestion[]> {
    const prompt = this.buildPrompt(input);
    
    const response = await this.callAI(prompt);
    
    const parsedQuestions = this.parseAIResponse(response);
    
    return parsedQuestions;
  }

  private buildPrompt(input: AIQuizGeneratorInput): string {
    return `Generate ${input.numberOfQuestions} multiple-choice quiz questions on the topic: "${input.topic}".
    
Difficulty level: ${input.difficulty || 'medium'}

For each question, provide:
1. A clear question text
2. Exactly 4 options (A, B, C, D)
3. The correct answer

Format the output as a JSON array with this exact structure:
[
  {
    "id": "unique-id-1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

Ensure all questions are accurate, educational, and have a single correct answer.`;
  }

  private async callAI(prompt: string): Promise<string> {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY || "";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const text = data.choices[0]?.message?.content;
      
      if (!text) {
        throw new Error('No text generated');
      }
      return text;
    } catch (error) {
      logger.error('AI generation failed', { error: (error as Error).message });
      throw new ExternalServiceError('AI Provider', `Failed to generate quiz: ${(error as Error).message}`);
    }
  }

  private getMockResponse(prompt: string): string {
    const truncatedPrompt = prompt.slice(0, 20);
    return `[
      {
        "id": "q1",
        "question": "Sample question about ${truncatedPrompt}?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A"
      }
    ]`;
  }

  private parseAIResponse(response: string): QuizQuestion[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response must be an array');
      }

      return parsed.map((item: Record<string, unknown>, index: number): QuizQuestion => ({
        id: String(item.id) || `q${index + 1}`,
        question: String(item.question || ''),
        options: Array.isArray(item.options) ? item.options.map(String) : [],
        correctAnswer: String(item.correctAnswer || ''),
      }));
    } catch (error) {
      logger.error('Failed to parse AI response', { error: (error as Error).message });
      throw new Error('Failed to parse generated quiz questions');
    }
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Quiz generation failed (attempt ${attempt}/${this.maxRetries})`, {
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

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Quiz generation timeout')), ms)
      ),
    ]);
  }
}

let quizGenerator: AIQuizGenerator | null = null;

export function initializeQuizGenerator(): AIQuizGenerator {
  logger.info('Initializing quiz generator');
  quizGenerator = new AIQuizGeneratorImpl();
  return quizGenerator;
}

export function getQuizGenerator(): AIQuizGenerator {
  if (!quizGenerator) {
    return initializeQuizGenerator();
  }
  return quizGenerator;
}
