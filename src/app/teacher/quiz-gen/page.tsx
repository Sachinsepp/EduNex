
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, HelpCircle, Sparkles, Check, Send, Users, BookOpen } from "lucide-react";
import { getQuiz, GenerateQuizQuestionsOutput } from "@/lib/actions";
import { createQuiz, getStudentsForTeacher, Student } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getCoursesForTeacher, Teacher, Course } from "@/lib/services";
import { getSession } from "@/lib/authService";
import { useEffect } from "react";

export default function QuizGeneratorPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [quizMode, setQuizMode] = useState<'OVERALL' | 'CUSTOMIZED'>('OVERALL');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession?.role === 'teacher') {
      setSession(currentSession as { user: Teacher; role: 'teacher' });
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!session) return;
      setIsLoadingCourses(true);
      try {
        const coursesData = await getCoursesForTeacher(session.user.id);
        setCourses(coursesData);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load courses." });
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [session, toast]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!session) return;
      setIsLoadingStudents(true);
      try {
        const studentsData = await getStudentsForTeacher(session.user.id);
        setStudents(studentsData);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load students." });
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [session, toast]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast({ variant: "destructive", title: "Missing Topic", description: "Please enter a topic for the quiz." });
      return;
    }

    setIsLoading(true);
    setQuiz(null);
    const result = await getQuiz({ topic, numQuestions });
    setIsLoading(false);

    if (result.success) {
      setQuiz(result.data);
    } else {
      toast({ variant: "destructive", title: "Generation Failed", description: result.error });
    }
  };

  const handleSendToStudents = async () => {
    if (!quiz) {
        toast({ variant: "destructive", title: "No Quiz", description: "Please generate a quiz first." });
        return;
    }

    if (quizMode === 'CUSTOMIZED' && selectedStudents.length === 0) {
        toast({ variant: "destructive", title: "No Students Selected", description: "Please select at least one student for customized quiz." });
        return;
    }

    if (!session) {
        toast({ variant: "destructive", title: "Error", description: "Session not found." });
        return;
    }

    setIsSaving(true);
    try {
        const questionsWithIds = quiz.questions.map((q, index) => ({
          id: `q${index + 1}-${Date.now()}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        }));

        const result = await createQuiz(
          session.user.id,
          {
            topic: topic,
            numberOfQuestions: numQuestions,
            quizType: quizMode,
            studentIds: quizMode === 'CUSTOMIZED' ? selectedStudents : undefined,
          },
          questionsWithIds
        );

        if (result.quiz.quizType === 'OVERALL') {
          toast({ 
            title: "Quiz Created!", 
            description: `Quiz assigned to all ${result.assignedCount} students successfully.` 
          });
        } else {
          toast({ 
            title: "Quiz Created!", 
            description: `Quiz assigned to ${result.assignedCount} selected student(s) successfully.` 
          });
        }
        
        setQuiz(null);
        setSelectedStudents([]);
        setTopic("");
    } catch (error) {
         console.error("Error creating quiz:", error);
         toast({ variant: "destructive", title: "Error", description: "Could not create the quiz." });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form onSubmit={handleGenerateQuiz}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle /> Quiz Generator</CardTitle>
              <CardDescription>
                Create a multiple-choice quiz on any topic for your students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topic">Quiz Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min="1"
                  max="20"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quiz Mode</Label>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mode-overall"
                      name="quizMode"
                      value="OVERALL"
                      checked={quizMode === 'OVERALL'}
                      onChange={() => {
                        setQuizMode('OVERALL');
                        setSelectedStudents([]);
                      }}
                      disabled={isLoading}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="mode-overall" className="font-normal cursor-pointer">
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      Overall (All Students)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mode-customized"
                      name="quizMode"
                      value="CUSTOMIZED"
                      checked={quizMode === 'CUSTOMIZED'}
                      onChange={() => setQuizMode('CUSTOMIZED')}
                      disabled={isLoading}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="mode-customized" className="font-normal cursor-pointer">
                      <Users className="inline h-4 w-4 mr-1" />
                      Customized (Select Students)
                    </Label>
                  </div>
                </div>
              </div>
              {quizMode === 'CUSTOMIZED' && (
                <div className="space-y-1.5">
                  <Label>Select Students</Label>
                  <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-normal"
                        disabled={isLoading || isLoadingStudents}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {selectedStudents.length === 0
                          ? "Select students..."
                          : `${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''} selected`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-2" align="start">
                      <div className="flex items-center space-x-2 pb-2 border-b mb-2">
                        <Checkbox
                          id="select-all-students"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onCheckedChange={handleSelectAllStudents}
                        />
                        <Label htmlFor="select-all-students" className="font-normal cursor-pointer">
                          Select All
                        </Label>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {isLoadingStudents ? (
                          <div className="text-center py-4 text-muted-foreground">Loading students...</div>
                        ) : students.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">No students found</div>
                        ) : (
                          students.map(student => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={() => handleStudentToggle(student.id)}
                              />
                              <Label htmlFor={`student-${student.id}`} className="font-normal cursor-pointer">
                                {student.name}
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Quiz
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[calc(100vh-16rem)]">
          <CardHeader>
            <CardTitle>Generated Quiz</CardTitle>
             {quiz && (
                  <div className="flex items-center gap-2 pt-4">
                     <div className="text-sm text-muted-foreground">
                        {quizMode === 'OVERALL' 
                          ? `Quiz will be assigned to all students in your class` 
                          : `Quiz will be assigned to ${selectedStudents.length} selected student(s)`}
                     </div>
                     <Button onClick={handleSendToStudents} disabled={quizMode === 'CUSTOMIZED' && selectedStudents.length === 0 || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        {quizMode === 'OVERALL' ? 'Assign to All Students' : 'Assign to Selected'}
                     </Button>
                  </div>
             )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : quiz ? (
              <div className="space-y-6">
                {quiz.questions.map((q, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium">{index + 1}. {q.question}</p>
                    <ul className="list-disc list-inside pl-4 space-y-1 text-muted-foreground">
                      {q.options.map(opt => (
                        <li key={opt} className={q.correctAnswer === opt ? "font-bold text-green-600 flex items-center gap-2" : ""}>
                          {opt}
                          {q.correctAnswer === opt && <Check className="h-4 w-4" />}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                <p>Your generated quiz will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
