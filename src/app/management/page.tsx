
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, BookOpen, Activity, PlusCircle, Loader2, Trash2, Edit, Search, Calendar as CalendarIcon, Video, CalendarDays } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { addTeacher, getTeachers, getStudents, getCourses, addCourse, Teacher, Student, Course, addStudent, deleteTeacher, deleteStudent, deleteCourse, updateTeacher, updateStudent, updateCourse } from "@/lib/services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";


type DeletionTarget = { type: 'teacher' | 'student' | 'course', id: string, name: string } | null;
type EditingTarget = { type: 'teacher', data: Teacher } | { type: 'student', data: Student } | { type: 'course', data: Course } | null;

export default function ManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget>(null);
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
  const [editLiveClassDate, setEditLiveClassDate] = useState<Date | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [activeTab, setActiveTab] = useState("status");
  const [detailView, setDetailView] = useState<'teachers' | 'students' | 'courses' | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [teachersData, studentsData, coursesData] = await Promise.all([
        getTeachers(),
        getStudents(),
        getCourses()
      ]);
      setTeachers(teachersData);
      setStudents(studentsData);
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingTeacher(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("teacherName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("teacherEmail") as HTMLInputElement).value;
    const password = (form.elements.namedItem("teacherPassword") as HTMLInputElement).value;

    try {
      await addTeacher({ name, email, password });
      toast({
        title: "Teacher Added",
        description: `${name} has been added successfully.`,
      });
      form.reset();
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the teacher.",
      });
    } finally {
      setIsAddingTeacher(false);
    }
  };
  
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStudent(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("studentName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("studentEmail") as HTMLInputElement).value;
    const password = (form.elements.namedItem("studentPassword") as HTMLInputElement).value;
    const grade = (form.elements.namedItem("studentGrade") as HTMLInputElement).value;
    const teacherId = (form.elements.namedItem("studentTeacher") as HTMLInputElement).value;

    try {
      await addStudent({ name, email, password, grade, teacherId });
      toast({
        title: "Student Added",
        description: `${name} has been added successfully.`,
      });
      form.reset();
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the student.",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };


  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCourse(true);
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem("courseTitle") as HTMLInputElement).value;
    const description = (form.elements.namedItem("courseDesc") as HTMLTextAreaElement).value;
    const modulesText = (form.elements.namedItem("courseModules") as HTMLTextAreaElement).value;
    const teacherId = (form.elements.namedItem("courseTeacher") as HTMLInputElement).value;
    const liveClassUrl = (form.elements.namedItem("liveClassUrl") as HTMLInputElement).value;
    const liveClassDate = (form.elements.namedItem("liveClassDate") as HTMLInputElement).value;
    const liveClassTime = (form.elements.namedItem("liveClassTime") as HTMLInputElement).value;
    
    const modules = modulesText.split('\n').filter(m => m.trim() !== '');

    let liveClass;
    if (liveClassUrl && liveClassDate && liveClassTime) {
      const [hours, minutes] = liveClassTime.split(':').map(Number);
      const dateTime = new Date(liveClassDate);
      dateTime.setHours(hours, minutes);
      liveClass = {
        url: liveClassUrl,
        dateTime: dateTime.toISOString(),
      };
    }

    try {
      await addCourse({ title, description, modules, teacherId, liveClass });
      toast({
        title: "Course Created",
        description: `The course "${title}" has been created.`,
      });
      form.reset();
      fetchDashboardData();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create the course.",
      });
    } finally {
        setIsCreatingCourse(false);
    }
  };

  const handleDelete = async () => {
    if (!deletionTarget) return;

    try {
      if (deletionTarget.type === 'teacher') {
        await deleteTeacher(deletionTarget.id);
      } else if (deletionTarget.type === 'student') {
        await deleteStudent(deletionTarget.id);
      } else if (deletionTarget.type === 'course') {
        await deleteCourse(deletionTarget.id);
      }
      toast({
        title: `${deletionTarget.type.charAt(0).toUpperCase() + deletionTarget.type.slice(1)} Deleted`,
        description: `${deletionTarget.name} has been removed.`,
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not delete ${deletionTarget.type}.`,
      });
    } finally {
      setDeletionTarget(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    setIsUpdating(true);
    const form = e.target as HTMLFormElement;

    try {
        if (editingTarget.type === 'teacher') {
            const updatedData: Partial<Teacher> = {
                name: (form.elements.namedItem("editTeacherName") as HTMLInputElement).value,
                email: (form.elements.namedItem("editTeacherEmail") as HTMLInputElement).value,
            };
            const passwordInput = (form.elements.namedItem("editTeacherPassword") as HTMLInputElement).value;
            if (passwordInput) {
              updatedData.password = passwordInput
            }
            await updateTeacher(editingTarget.data.id, updatedData);
        } else if (editingTarget.type === 'student') {
            const updatedData: Partial<Student> = {
                name: (form.elements.namedItem("editStudentName") as HTMLInputElement).value,
                email: (form.elements.namedItem("editStudentEmail") as HTMLInputElement).value,
                grade: (form.elements.namedItem("editStudentGrade") as HTMLInputElement).value,
                teacherId: (form.elements.namedItem("editStudentTeacher") as HTMLSelectElement).value,
            };
            const passwordInput = (form.elements.namedItem("editStudentPassword") as HTMLInputElement).value;
            if (passwordInput) {
              updatedData.password = passwordInput
            }
            await updateStudent(editingTarget.data.id, updatedData);
        } else if (editingTarget.type === 'course') {
           const modulesText = (form.elements.namedItem("editCourseModules") as HTMLTextAreaElement).value;
           const modules = modulesText.split('\n').filter(m => m.trim() !== '');
           const liveClassUrl = (form.elements.namedItem("editLiveClassUrl") as HTMLInputElement).value;
           const liveClassTime = (form.elements.namedItem("editLiveClassTime") as HTMLInputElement).value;
           
           let liveClass;
            if (liveClassUrl && editLiveClassDate && liveClassTime) {
              const [hours, minutes] = liveClassTime.split(':').map(Number);
              const dateTime = new Date(editLiveClassDate);
              dateTime.setHours(hours, minutes);
              liveClass = {
                url: liveClassUrl,
                dateTime: dateTime.toISOString(),
              };
            } else {
              liveClass = undefined;
            }

           const updatedData: Course = {
               ...editingTarget.data,
               title: (form.elements.namedItem("editCourseTitle") as HTMLInputElement).value,
               description: (form.elements.namedItem("editCourseDesc") as HTMLTextAreaElement).value,
               teacherId: (form.elements.namedItem("editCourseTeacher") as HTMLSelectElement).value,
               modules: modules,
               liveClass: liveClass,
           };
           await updateCourse(updatedData.id, updatedData);
        }
        
        toast({
            title: "Update Successful",
            description: "Information has been updated.",
        });
        fetchDashboardData();
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: `Could not update the ${editingTarget.type}.`,
        });
    } finally {
        setIsUpdating(false);
        setEditingTarget(null);
        setEditLiveClassDate(undefined);
    }
  }

  useEffect(() => {
    if (editingTarget?.type === 'course' && editingTarget.data.liveClass?.dateTime) {
      setEditLiveClassDate(new Date(editingTarget.data.liveClass.dateTime));
    } else {
      setEditLiveClassDate(undefined);
    }
  }, [editingTarget]);

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  return (
    <DashboardPage title="Management Dashboard" role="Management">
      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-1 sm:grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="status"><Activity className="mr-2 h-4 w-4" />System Status</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
          <TabsTrigger value="courses"><BookOpen className="mr-2 h-4 w-4" />Course Management</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
           <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                An overview of the platform's current state.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailView('teachers')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Teachers</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{teachers.length}</div>}
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailView('students')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{students.length}</div>}
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailView('courses')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{courses.length}</div>}
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/management/timetable')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Master Timetable</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage Schedule</div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add a New Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTeacher} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="teacherName">Full Name</Label>
                    <Input id="teacherName" name="teacherName" placeholder="e.g., Jane Doe" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="teacherEmail">Email Address</Label>
                    <Input id="teacherEmail" name="teacherEmail" type="email" placeholder="e.g., jane.doe@school.com" required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="teacherPassword">Password</Label>
                    <Input id="teacherPassword" name="teacherPassword" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isAddingTeacher}>
                    {isAddingTeacher ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     Add Teacher
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add a New Student</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input id="studentName" name="studentName" placeholder="e.g., Alex Doe" required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="studentEmail">Email Address</Label>
                    <Input id="studentEmail" name="studentEmail" type="email" placeholder="e.g., alex.doe@school.com" required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="studentPassword">Password</Label>
                    <Input id="studentPassword" name="studentPassword" type="password" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="studentGrade">Grade</Label>
                    <Input id="studentGrade" name="studentGrade" placeholder="e.g., 10th Grade" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="studentTeacher">Assign Teacher</Label>
                    <Select name="studentTeacher" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full xl:col-span-5" disabled={isAddingStudent}>
                    {isAddingStudent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     Add Student
                  </Button>
                </form>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Manage Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && teachers.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.email}</TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingTarget({ type: 'teacher', data: t })}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeletionTarget({ type: 'teacher', id: t.id!, name: t.name })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Manage Students</CardTitle>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-8"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                    />
                </div>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Assigned Teacher</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {isLoading && <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && filteredStudents.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.grade}</TableCell>
                          <TableCell>{teachers.find(t => t.id === s.teacherId)?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingTarget({ type: 'student', data: s })}>
                                <Edit className="h-4 w-4" />
                              </Button>
                             <Button variant="destructive" size="sm" onClick={() => setDeletionTarget({ type: 'student', id: s.id!, name: s.name })}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!isLoading && filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No students found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="courses">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Course</CardTitle>
                <CardDescription>Fill in the details to create a new course.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="courseTitle">Course Title</Label>
                      <Input id="courseTitle" name="courseTitle" placeholder="e.g., Introduction to Algebra" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="courseTeacher">Assign Teacher</Label>
                      <Select name="courseTeacher" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="courseDesc">Course Description</Label>
                    <Textarea id="courseDesc" name="courseDesc" placeholder="A brief summary of the course content." required />
                  </div>
                  <div>
                    <Label htmlFor="courseModules">Modules (one per line)</Label>
                    <Textarea id="courseModules" name="courseModules" placeholder="Module 1: Basic Equations&#10;Module 2: Functions" rows={4} required />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="liveClassUrl">Live Class URL (Optional)</Label>
                        <Input id="liveClassUrl" name="liveClassUrl" placeholder="https://meet.google.com/..." />
                     </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="liveClassDate">Live Class Date</Label>
                        <Input type="date" id="liveClassDate" name="liveClassDate" />
                     </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="liveClassTime">Live Class Time</Label>
                        <Input type="time" id="liveClassTime" name="liveClassTime" />
                     </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreatingCourse}>
                     {isCreatingCourse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     Create Course
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Assigned Teacher</TableHead>
                        <TableHead>Modules</TableHead>
                        <TableHead>Live Class</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>}
                      {!isLoading && courses.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.title}</TableCell>
                          <TableCell>{teachers.find(t => t.id === c.teacherId)?.name || 'N/A'}</TableCell>
                          <TableCell>{c.modules.length}</TableCell>
                          <TableCell>{c.liveClass ? 'Scheduled' : 'None'}</TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingTarget({ type: 'course', data: c })}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="destructive" size="sm" onClick={() => setDeletionTarget({ type: 'course', id: c.id!, name: c.title })}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Deletion Dialog */}
      <AlertDialog open={!!deletionTarget} onOpenChange={() => setDeletionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deletionTarget?.type} <strong>{deletionTarget?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Edit Dialog */}
       <Dialog open={!!editingTarget} onOpenChange={(open) => { if (!open) { setEditingTarget(null); setEditLiveClassDate(undefined); }}}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit {editingTarget?.type?.charAt(0).toUpperCase()}{editingTarget?.type?.slice(1)}</DialogTitle>
              <DialogDescription>
                 Update the details for {editingTarget ? ('name' in editingTarget.data ? editingTarget.data.name : editingTarget.data.title) : ''}.
              </DialogDescription>
            </DialogHeader>

            {editingTarget?.type === 'teacher' && (
              <div className="grid gap-4 py-4">
                 <div className="grid gap-1.5">
                    <Label htmlFor="editTeacherName">Full Name</Label>
                    <Input id="editTeacherName" name="editTeacherName" defaultValue={editingTarget.data.name} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="editTeacherEmail">Email Address</Label>
                    <Input id="editTeacherEmail" name="editTeacherEmail" type="email" defaultValue={editingTarget.data.email} required />
                  </div>
                   <div className="grid gap-1.5">
                    <Label htmlFor="editTeacherPassword">New Password (optional)</Label>
                    <Input id="editTeacherPassword" name="editTeacherPassword" type="password" placeholder="Leave blank to keep current password" />
                  </div>
              </div>
            )}

            {editingTarget?.type === 'student' && (
                <div className="grid gap-4 py-4">
                     <div className="grid gap-1.5">
                        <Label htmlFor="editStudentName">Full Name</Label>
                        <Input id="editStudentName" name="editStudentName" defaultValue={editingTarget.data.name} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editStudentEmail">Email Address</Label>
                        <Input id="editStudentEmail" name="editStudentEmail" type="email" defaultValue={editingTarget.data.email} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editStudentPassword">New Password (optional)</Label>
                        <Input id="editStudentPassword" name="editStudentPassword" type="password" placeholder="Leave blank to keep current password" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editStudentGrade">Grade</Label>
                        <Input id="editStudentGrade" name="editStudentGrade" defaultValue={(editingTarget.data as Student).grade} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editStudentTeacher">Assign Teacher</Label>
                        <Select name="editStudentTeacher" required defaultValue={(editingTarget.data as Student).teacherId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            
            {editingTarget?.type === 'course' && (
                <div className="grid gap-4 py-4">
                     <div className="grid gap-1.5">
                        <Label htmlFor="editCourseTitle">Course Title</Label>
                        <Input id="editCourseTitle" name="editCourseTitle" defaultValue={editingTarget.data.title} required />
                    </div>
                     <div className="grid gap-1.5">
                        <Label htmlFor="editCourseTeacher">Assign Teacher</Label>
                        <Select name="editCourseTeacher" required defaultValue={(editingTarget.data as Course).teacherId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-1.5">
                       <Label htmlFor="editCourseDesc">Course Description</Label>
                       <Textarea id="editCourseDesc" name="editCourseDesc" defaultValue={(editingTarget.data as Course).description} required />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="editCourseModules">Modules (one per line)</Label>
                        <Textarea id="editCourseModules" name="editCourseModules" defaultValue={(editingTarget.data as Course).modules.join('\n')} rows={4} required />
                    </div>
                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="editLiveClassUrl">Live Class URL (Optional)</Label>
                            <Input id="editLiveClassUrl" name="editLiveClassUrl" placeholder="https://meet.google.com/..." defaultValue={(editingTarget.data as Course).liveClass?.url} />
                        </div>
                        <div className="space-y-1.5">
                             <Label htmlFor="editLiveClassDate">Live Class Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !editLiveClassDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editLiveClassDate ? format(editLiveClassDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={editLiveClassDate}
                                    onSelect={setEditLiveClassDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="editLiveClassTime">Live Class Time</Label>
                            <Input type="time" id="editLiveClassTime" name="editLiveClassTime" defaultValue={editingTarget.data.liveClass?.dateTime ? format(new Date(editingTarget.data.liveClass.dateTime), 'HH:mm') : ""} />
                        </div>
                    </div>
                </div>
            )}


            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={!!detailView} onOpenChange={() => setDetailView(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailView === 'teachers' && 'Registered Teachers'}
              {detailView === 'students' && 'Enrolled Students'}
              {detailView === 'courses' && 'Available Courses'}
            </DialogTitle>
          </DialogHeader>
          
          {detailView === 'teachers' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center">No teachers found</TableCell></TableRow>
                ) : teachers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {detailView === 'students' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">No students found</TableCell></TableRow>
                ) : students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.grade}</TableCell>
                    <TableCell>{teachers.find(t => t.id === s.teacherId)?.name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {detailView === 'courses' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Modules</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center">No courses found</TableCell></TableRow>
                ) : courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{teachers.find(t => t.id === c.teacherId)?.name || 'N/A'}</TableCell>
                    <TableCell>{c.modules.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailView(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
