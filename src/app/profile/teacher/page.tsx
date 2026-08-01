"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { BookOpen, User, Users, Loader2 } from "lucide-react";
import { getCoursesForTeacher, getStudentsForTeacher, Course, Student, Teacher } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";

export default function TeacherProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'teacher') {
      router.push('/teacher/login');
      return;
    }
    setTeacher(session.user as Teacher);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!teacher) return;
      setIsLoading(true);
      try {
        const [coursesData, studentsData] = await Promise.all([
            getCoursesForTeacher(teacher.id!),
            getStudentsForTeacher(teacher.id!),
        ]);
        setAssignedCourses(coursesData);
        setAssignedStudents(studentsData);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load profile data.`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (teacher) {
        fetchData();
    }
  }, [teacher, toast]);
  
  const getEnrolledCountForCourse = (courseId: string) => {
    // This is a simplification. In a real app, you'd filter students by course enrollment.
    // For this prototype, we'll assume all of a teacher's students are in all their courses.
    return assignedStudents.length;
  }

  if (!teacher) {
    return (
       <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={`https://placehold.co/128x128.png?text=${teacher.name.charAt(0)}`} alt={teacher.name} data-ai-hint="profile picture" />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{teacher.name}</CardTitle>
              <Badge variant="secondary">Teacher</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{teacher.email}</p>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 grid gap-8">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Assigned Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                    ): assignedCourses.length > 0 ? (
                      assignedCourses.map((course) => (
                      <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{getEnrolledCountForCourse(course.id!)}</TableCell>
                      </TableRow>
                      ))
                    ) : (
                      <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                              No courses assigned.
                          </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                My Students
              </CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoading ? (
                         <TableRow>
                            <TableCell colSpan={2} className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                   ) : assignedStudents.length > 0 ? (
                      assignedStudents.map((student) => (
                      <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.grade}</TableCell>
                      </TableRow>
                      ))
                   ) : (
                       <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                              No students assigned.
                          </TableCell>
                      </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
