'use server';
/**
 * @fileOverview An AI agent for generating lesson plan assistance for teachers.
 *
 * - generateLessonPlanAssistance - A function that handles the lesson plan generation process.
 * - GenerateLessonPlanAssistanceInput - The input type for the generateLessonPlanAssistance function.
 * - GenerateLessonPlanAssistanceOutput - The return type for the generateLessonPlanAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanAssistanceInputSchema = z.object({
  subject: z.string().describe('The subject of the lesson plan.'),
  gradeLevel: z.string().describe('The grade level of the lesson plan.'),
});
export type GenerateLessonPlanAssistanceInput = z.infer<typeof GenerateLessonPlanAssistanceInputSchema>;

const GenerateLessonPlanAssistanceOutputSchema = z.object({
  lessonPlanOutline: z.string().describe('A basic lesson plan outline for the specified subject and grade level.'),
});
export type GenerateLessonPlanAssistanceOutput = z.infer<typeof GenerateLessonPlanAssistanceOutputSchema>;

export async function generateLessonPlanAssistance(input: GenerateLessonPlanAssistanceInput): Promise<GenerateLessonPlanAssistanceOutput> {
  return generateLessonPlanAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanAssistancePrompt',
  input: {schema: GenerateLessonPlanAssistanceInputSchema},
  output: {schema: GenerateLessonPlanAssistanceOutputSchema},
  prompt: `You are an AI assistant helping teachers generate lesson plan outlines.

  Please generate a basic lesson plan outline for the following subject and grade level:

  Subject: {{{subject}}}
  Grade Level: {{{gradeLevel}}}
  `,
});

const generateLessonPlanAssistanceFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanAssistanceFlow',
    inputSchema: GenerateLessonPlanAssistanceInputSchema,
    outputSchema: GenerateLessonPlanAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
