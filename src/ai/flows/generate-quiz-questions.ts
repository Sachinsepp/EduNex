'use server';

/**
 * @fileOverview AI flow for generating quiz questions for teachers.
 *
 * - generateQuizQuestions - A function that generates quiz questions based on a topic.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions.'),
  numQuestions: z.number().default(5).describe('The number of quiz questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).describe('An array of 4 multiple-choice options.'),
  correctAnswer: z.string().describe('The correct answer from the provided options.'),
});

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of generated quiz questions, each with options and a correct answer.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  const promptText = `You are an expert quiz creator for an educational platform. Your role is to generate a specified number of multiple-choice quiz questions based on the provided topic.

  Please generate ${input.numQuestions} quiz questions on the following topic: "${input.topic}".

  For each question, provide exactly 4 multiple-choice options and clearly indicate which one is the correct answer.

  The output MUST be a valid JSON object. It should contain a key named "questions", which holds an array of objects. Each object in the array must have the following keys: "question", "options" (an array of 4 strings), and "correctAnswer" (a string that exactly matches one of the options).
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: promptText }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return { questions: parsed.questions || [] };
  } catch (error) {
    console.error("Error calling OpenRouter for quiz questions:", error);
    throw error;
  }
}
