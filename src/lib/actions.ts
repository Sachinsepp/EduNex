"use server";

import { generateLessonPlanAssistance, GenerateLessonPlanAssistanceInput, GenerateLessonPlanAssistanceOutput } from "@/ai/flows/generate-lesson-plan-assistance";
import { generateQuizQuestions, GenerateQuizQuestionsInput, GenerateQuizQuestionsOutput } from "@/ai/flows/generate-quiz-questions";
import { tutorStudent, TutorStudentInput, TutorStudentOutput } from "@/ai/flows/tutor-student";
import { generateCertificate, GenerateCertificateInput, GenerateCertificateOutput } from "@/ai/flows/generate-certificate";

type LessonPlanResult = {
  success: true;
  data: GenerateLessonPlanAssistanceOutput;
} | {
  success: false;
  error: string;
};

type QuizResult = {
  success: true;
  data: GenerateQuizQuestionsOutput;
} | {
  success: false;
  error: string;
};

type TutorResult = {
  success: true;
  data: TutorStudentOutput;
} | {
  success: false;
  error: string;
};

type CertificateResult = {
  success: true;
  data: GenerateCertificateOutput;
} | {
  success: false;
  error: string;
};

export async function getLessonPlan(input: GenerateLessonPlanAssistanceInput): Promise<LessonPlanResult> {
  if (!input.subject || !input.gradeLevel) {
    return { success: false, error: "Subject and Grade Level are required." };
  }

  try {
    const result = await generateLessonPlanAssistance(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return { success: false, error: "An unexpected error occurred while generating the lesson plan." };
  }
}

export async function getQuiz(input: GenerateQuizQuestionsInput): Promise<QuizResult> {
  if (!input.topic || !input.numQuestions) {
    return { success: false, error: "Topic and Number of Questions are required." };
  }
  
  try {
    const result = await generateQuizQuestions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return { success: false, error: "An unexpected error occurred while generating the quiz." };
  }
}

export async function getTutorResponse(input: TutorStudentInput): Promise<TutorResult> {
  if (!input.question || !input.topic) {
    return { success: false, error: "Question and topic are required." };
  }
  
  try {
    const result = await tutorStudent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting tutor response:", error);
    return { success: false, error: "An unexpected error occurred while getting a response." };
  }
}

export async function getCertificate(input: GenerateCertificateInput): Promise<CertificateResult> {
  if (!input.studentName || !input.courseName || !input.date) {
    return { success: false, error: "Student name, course name, and date are required." };
  }
  
  try {
    const result = await generateCertificate(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return { success: false, error: "An unexpected error occurred while generating the certificate." };
  }
}


// Export types for use in client components
export type { GenerateLessonPlanAssistanceOutput, GenerateQuizQuestionsOutput, TutorStudentOutput, GenerateCertificateOutput };
