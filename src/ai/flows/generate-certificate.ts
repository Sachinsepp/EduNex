'use server';
/**
 * @fileOverview An AI agent for generating a course completion certificate.
 *
 * - generateCertificate - A function that handles the certificate generation process.
 * - GenerateCertificateInput - The input type for the generateCertificate function.
 * - GenerateCertificateOutput - The return type for the generateCertificate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCertificateInputSchema = z.object({
  studentName: z.string().describe("The full name of the student who completed the course."),
  courseName: z.string().describe("The title of the course that was completed."),
  date: z.string().describe("The completion date in the format 'Month Day, Year'.")
});
export type GenerateCertificateInput = z.infer<typeof GenerateCertificateInputSchema>;

const GenerateCertificateOutputSchema = z.object({
  certificateHtml: z.string().describe("The full HTML content of the certificate, styled with inline CSS. It should have a professional and official design with a border, the platform name 'EduNex', a title 'Certificate of Completion', the student's name, the course name, the completion date, and a signature line for the 'Head Instructor'. The background should be a very light gray (#f9f9f9) and the primary color should be deep sky blue (#3498db). The font should be 'Inter' or a similar sans-serif font."),
});
export type GenerateCertificateOutput = z.infer<typeof GenerateCertificateOutputSchema>;


export async function generateCertificate(input: GenerateCertificateInput): Promise<GenerateCertificateOutput> {
  return generateCertificateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCertificatePrompt',
  input: { schema: GenerateCertificateInputSchema },
  output: { schema: GenerateCertificateOutputSchema },
  prompt: `You are a certificate designer for an online learning platform called EduNex.
  
  Your task is to generate the full HTML for a course completion certificate. The output must be a single HTML string with inline CSS for styling.

  The certificate must include:
  - A professional-looking border.
  - The platform name: "EduNex".
  - A main title: "Certificate of Completion".
  - A statement confirming the completion, like "This certificate is proudly presented to".
  - The student's name: {{{studentName}}}.
  - A statement about the course, like "for successfully completing the course".
  - The course name: {{{courseName}}}.
  - The completion date: {{{date}}}.
  - A signature line for the "Head Instructor".

  Use a clean, modern design. The background color should be a very light gray (#f9f9f9). The primary color for text and borders should be deep sky blue (#3498db). The font should be 'Inter' or a professional-looking sans-serif font.
  `,
});

const generateCertificateFlow = ai.defineFlow(
  {
    name: 'generateCertificateFlow',
    inputSchema: GenerateCertificateInputSchema,
    outputSchema: GenerateCertificateOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
