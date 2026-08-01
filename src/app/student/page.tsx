
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Send, Bot, Loader2, CalendarCheck, Film, Award, CheckCircle, User, Video, HelpCircle, XCircle, Trophy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { getCertificate } from "@/lib/actions";
import { getCoursesForStudent, Course, Student } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";


// Simulate progress for each course
const useSimulatedProgress = (courses: Course[]) => {
  const progress = useMemo(() => {
    if (courses.length === 0) return {};
    const newProgress: Record<string, number> = {};
    courses.forEach(course => {
      // Create a stable but pseudo-random progress value based on course ID
      if (course.id) {
        const pseudoRandom = (course.id.charCodeAt(1) % 5) * 20 + 10;
        newProgress[course.id] = pseudoRandom;
      }
    });
    return newProgress;
  }, [courses]);

  return progress;
};


export default function StudentPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);
  const courseProgress = useSimulatedProgress(courses);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    const currentSession = getSession();
    // Layout now handles redirection
    if (currentSession && currentSession.role === 'student') {
      setSession(currentSession as { user: Student; role: 'student' });
    }
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const coursesData = await getCoursesForStudent(session.user.id);
        
        setCourses(coursesData);
       
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (session) {
      fetchStudentData();
    }
  }, [session, toast]);

  const handleGenerateCertificate = async (courseName: string) => {
    if (!session) return;
    setIsGeneratingCert(courseName);
    const result = await getCertificate({
      studentName: session.user.name,
      courseName: courseName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });
    
    if (result.success) {
      const newWindow = window.open();
      newWindow?.document.write(result.data.certificateHtml);
      newWindow?.document.close();
    } else {
       toast({
        variant: "destructive",
        title: "Certificate Generation Failed",
        description: result.error,
      });
    }
    setIsGeneratingCert(null);
  }

  if (isLoading || !session) {
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
      <div className="grid gap-6">
        <Card>
            <CardHeader>
              <CardTitle>Welcome back, {session.user.name}!</CardTitle>
              <CardDescription>Here is a summary of your current progress and upcoming classes.</CardDescription>
            </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Access your enrolled courses, modules, and track your progress.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : courses.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  You are not enrolled in any courses yet.
                </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {courses.map((course) => (
                  <AccordionItem value={course.id!} key={course.id}>
                    <AccordionTrigger className="text-lg font-medium hover:no-underline">
                      <div className="w-full pr-8">
                          <div className="flex justify-between items-center w-full">
                              <span>{course.title}</span>
                              <span className="text-sm font-normal text-muted-foreground">{courseProgress[course.id!]}% Complete</span>
                          </div>
                          <Progress value={courseProgress[course.id!]} className="mt-2 h-2" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                         <p className="text-muted-foreground mb-4">{course.description}</p>
                         {course.liveClass && (
                          <Card className="bg-primary/10 border-primary/40">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Video className="h-5 w-5 text-primary" />
                                  Live Class Session
                                </div>
                              </CardTitle>
                              <CardDescription>
                                {isClient ? format(new Date(course.liveClass.dateTime), "eeee, MMMM d, yyyy 'at' h:mm a") : 'Loading date...'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Link href={course.liveClass.url} target="_blank" rel="noopener noreferrer">
                                 <Button className="w-full">
                                    Join Live Class
                                 </Button>
                              </Link>
                            </CardContent>
                          </Card>
                         )}

                        {course.modules.map((module, moduleIndex) => (
                            <Card key={moduleIndex}>
                               <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Film className="h-5 w-5 text-primary" />
                                        {module}
                                      </div>
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    </CardTitle>
                               </CardHeader>
                               <CardContent>
                                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                       <p className="text-muted-foreground">Video player placeholder</p>
                                    </div>
                               </CardContent>
                            </Card>
                        ))}
                         <div className="pt-4 flex justify-end">
                          <Button
                            onClick={() => handleGenerateCertificate(course.title)}
                            disabled={isGeneratingCert === course.title}
                          >
                            {isGeneratingCert === course.title ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Award className="mr-2 h-4 w-4" />
                            )}
                            Generate Certificate
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
