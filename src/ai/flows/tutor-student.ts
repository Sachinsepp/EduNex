'use server';

/**
 * @fileOverview An AI agent that acts as a student tutor.
 *
 * - tutorStudent - A function that allows a student to ask questions about a topic.
 * - TutorStudentInput - The input type for the tutorStudent function.
 * - TutorStudentOutput - The return type for the tutorStudent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TutorStudentInputSchema = z.object({
  question: z.string().describe('The student\'s question.'),
  topic: z.string().describe('The course topic the question is about. e.g., "Algebra", "World History"'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the model.'),
});
export type TutorStudentInput = z.infer<typeof TutorStudentInputSchema>;

const TutorStudentOutputSchema = z.object({
  answer: z.string().describe('The AI tutor\'s answer to the student\'s question.'),
});
export type TutorStudentOutput = z.infer<typeof TutorStudentOutputSchema>;


export async function tutorStudent(input: TutorStudentInput): Promise<TutorStudentOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  
  const systemPrompt = `You are EduNex, an expert tutor for students. Your goal is to help students understand their course material.

You will answer questions about the following topic: ${input.topic}.

Be friendly, encouraging, and clear in your explanations. If a question is outside the scope of the topic, gently guide them back to the subject.`;

  const messages: any[] = [];
  messages.push({ role: "system", content: systemPrompt });

  if (input.history && input.history.length > 0) {
    input.history.forEach(h => {
      messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content });
    });
  }

  messages.push({ role: "user", content: input.question });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    
    return { answer: text || "I'm sorry, I couldn't generate a response." };
  } catch (error) {
    console.error("Error calling OpenRouter for AI tutor:", error);
    throw error;
  }
}
