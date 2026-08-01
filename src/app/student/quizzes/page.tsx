
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, HelpCircle, Trophy, CheckCircle, XCircle } from "lucide-react";
import { getQuizzesForStudent, submitQuiz, Student, Quiz, QuizAssignment } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { cn } from "@/lib/utils";

type QuizAnswers = Record<string, string>; // Maps questionId to answer string
type QuizResult = {
    score: number;
    total: number;
    answers: QuizAnswers;
} | null;

export default function StudentQuizzesPage() {
    const { toast } = useToast();
    const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
    const [assignedQuizzes, setAssignedQuizzes] = useState<{ quiz: Quiz; assignment: QuizAssignment }[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");
    
    // Instead of GenerateQuizQuestionsOutput, we use the selected Quiz directly
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
    const [answers, setAnswers] = useState<QuizAnswers>({});
    const [result, setResult] = useState<QuizResult>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const currentSession = getSession();
        if (currentSession?.role === 'student') {
            setSession(currentSession as { user: Student; role: 'student' });
        }
    }, []);

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!session) return;
            setIsLoadingQuizzes(true);
            try {
                const quizzesData = await getQuizzesForStudent(session.user.id);
                setAssignedQuizzes(quizzesData);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load assigned quizzes." });
            } finally {
                setIsLoadingQuizzes(false);
            }
        };
        fetchQuizzes();
    }, [session, toast]);

    const handleQuizChange = (quizId: string) => {
        setSelectedQuizId(quizId);
        setResult(null);
        setAnswers({});
        
        const selected = assignedQuizzes.find(q => q.quiz.id === quizId);
        if (selected && selected.assignment.status === 'COMPLETED') {
            toast({ variant: "default", title: "Information", description: "You have already completed this quiz. Check your score below." });
            setResult({
                score: Math.round(((selected.assignment.score || 0) / 100) * selected.quiz.questions.length),
                total: selected.quiz.questions.length,
                answers: {} // We don't store historical answers in the mock db currently
            });
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const activeQuizObj = assignedQuizzes.find(q => q.quiz.id === selectedQuizId);
        if (!activeQuizObj || !session) return;
        
        const { quiz } = activeQuizObj;
        setIsSubmitting(true);

        const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
        }));

        try {
            const submissionResult = await submitQuiz(session.user.id, quiz.id, answersArray);
            setResult({
                score: submissionResult.score,
                total: submissionResult.total,
                answers: answers
            });
            
            // Re-fetch quizzes to update status locally
            const quizzesData = await getQuizzesForStudent(session.user.id);
            setAssignedQuizzes(quizzesData);
            
            toast({ title: "Quiz Submitted", description: `You scored ${submissionResult.score} out of ${submissionResult.total}` });
        } catch(error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message || "Could not save your quiz result." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeQuizObj = assignedQuizzes.find(q => q.quiz.id === selectedQuizId);
    const activeQuiz = activeQuizObj?.quiz;
    const isCompleted = activeQuizObj?.assignment.status === 'COMPLETED';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle /> Take a Quiz</CardTitle>
                    <CardDescription>Select an assigned quiz to test your knowledge.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleQuizChange} value={selectedQuizId} disabled={isLoadingQuizzes}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a quiz..." />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingQuizzes ? (
                                <SelectItem value="loading" disabled>Loading quizzes...</SelectItem>
                            ) : assignedQuizzes.length === 0 ? (
                                <SelectItem value="none" disabled>No quizzes assigned</SelectItem>
                            ) : (
                                assignedQuizzes.map(({ quiz, assignment }) => (
                                    <SelectItem key={quiz.id} value={quiz.id}>
                                        {quiz.topic} {assignment.status === 'COMPLETED' ? '(Completed)' : '(Pending)'}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {activeQuizObj && activeQuiz && !isCompleted && !result && (
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Quiz: {activeQuiz.topic}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {activeQuiz.questions.map((q, index) => (
                                <fieldset key={q.id}>
                                    <legend className="font-medium mb-4">{index + 1}. {q.question}</legend>
                                    <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)} className="space-y-2">
                                        {q.options.map((option, i) => (
                                            <div key={i} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={`${q.id}-o${i}`} />
                                                <Label htmlFor={`${q.id}-o${i}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </fieldset>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting || Object.keys(answers).length < activeQuiz.questions.length}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Submit Quiz
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {(result || isCompleted) && activeQuizObj && activeQuiz && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy /> Quiz Result</CardTitle>
                        <CardDescription>You scored {result?.score ?? Math.round(((activeQuizObj.assignment.score || 0) / 100) * activeQuiz.questions.length)} out of {result?.total ?? activeQuiz.questions.length}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground">You have successfully completed this quiz. Detailed questions and answers are hidden after submission.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
