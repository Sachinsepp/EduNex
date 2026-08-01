"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Loader2, BarChart3, User, BookOpen } from "lucide-react";
import { getQuizAssignmentsForTeacher, getStudentsForTeacher, Student, Teacher, Quiz, QuizAssignment } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { StudentProgressChart } from "@/components/analytics/student-progress-chart";

export default function TeacherAnalyticsPage() {
    const { toast } = useToast();
    const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [quizDataList, setQuizDataList] = useState<{ quiz: Quiz; assignments: QuizAssignment[] }[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const currentSession = getSession();
        if (currentSession?.role === 'teacher') {
            setSession(currentSession as { user: Teacher; role: 'teacher' });
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!session) return;
            setIsLoading(true);
            try {
                const [quizzesData, studentsData] = await Promise.all([
                    getQuizAssignmentsForTeacher(session.user.id),
                    getStudentsForTeacher(session.user.id),
                ]);
                setQuizDataList(quizzesData);
                setStudents(studentsData);
                 if (quizzesData.length > 0) {
                    setSelectedQuizId(quizzesData[0].quiz.id);
                }
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Failed to load initial data." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [session, toast]);

    const handleQuizChange = (quizId: string) => {
        setSelectedQuizId(quizId);
    }
    
    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown Student';

    const selectedQuizObj = quizDataList.find(q => q.quiz.id === selectedQuizId);
    const chartResults = selectedQuizObj ? selectedQuizObj.assignments
        .filter(a => a.status === 'COMPLETED' && a.score !== null)
        .map(a => ({
            studentId: a.studentId,
            courseId: '',
            score: a.score!,
            total: 100, // Score is already a percentage, so setting total to 100 works for the chart scaling
            takenAt: a.completedAt!
        })) : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3/> Student Analytics</CardTitle>
                    <CardDescription>Review student performance and quiz results.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Select onValueChange={handleQuizChange} value={selectedQuizId} disabled={isLoading}>
                        <SelectTrigger className="max-w-sm">
                            <SelectValue placeholder="Select a quiz..." />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value="loading" disabled>Loading quizzes...</SelectItem>
                            ) : quizDataList.length === 0 ? (
                                <SelectItem value="none" disabled>No quizzes found</SelectItem>
                            ) : (
                                quizDataList.map(data => <SelectItem key={data.quiz.id} value={data.quiz.id}>{data.quiz.topic}</SelectItem>)
                            )}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : selectedQuizObj ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Class Average</CardTitle>
                            <CardDescription>Average score across all submitted quizzes for this quiz.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {chartResults.length > 0 ? (
                                <StudentProgressChart data={chartResults} />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No students have completed this quiz yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Individual Results</CardTitle>
                            <CardDescription>
                                {selectedQuizObj.assignments.filter(a => a.status === 'COMPLETED').length} of {selectedQuizObj.assignments.length} students completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Status / Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedQuizObj.assignments.map(assignment => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">{getStudentName(assignment.studentId)}</TableCell>
                                            <TableCell className="text-right">
                                                {assignment.status === 'COMPLETED' ? (
                                                    <span className="font-bold text-green-600">{assignment.score}%</span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Pending</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                 <Card className="text-center py-16">
                    <CardContent>
                        <p className="text-muted-foreground">No quizzes found.</p>
                        <p className="text-sm text-muted-foreground mt-2">Generate a quiz first to see student analytics.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
