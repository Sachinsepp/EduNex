"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { getTeacherTimetable, saveTeacherTimetable, getStudentTimetable, saveStudentTimetable, getTeachers, TeacherTimetableEntry, StudentTimetableEntry, Teacher } from "@/lib/services";

export default function ManagementTimetablePage() {
  const { toast } = useToast();
  const [teacherTimetable, setTeacherTimetable] = useState<TeacherTimetableEntry[]>([]);
  const [studentTimetable, setStudentTimetable] = useState<StudentTimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setIsLoading(true);
    try {
      const [tData, sData, teachersData] = await Promise.all([
        getTeacherTimetable(),
        getStudentTimetable(),
        getTeachers()
      ]);
      setTeacherTimetable(tData);
      setStudentTimetable(sData);
      setTeachers(teachersData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load timetables." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherFieldChange = (index: number, field: keyof TeacherTimetableEntry, value: string) => {
    const updated = [...teacherTimetable];
    updated[index] = { ...updated[index], [field]: value };
    setTeacherTimetable(updated);
  };

  const handleStudentFieldChange = (index: number, field: keyof StudentTimetableEntry, value: string) => {
    const updated = [...studentTimetable];
    updated[index] = { ...updated[index], [field]: value };
    setStudentTimetable(updated);
  };

  const handleAddTeacherRow = () => {
    const newEntry: TeacherTimetableEntry = {
      id: `tt${Date.now()}`,
      day: 'Monday',
      timeSlot: '08:00 AM - 09:00 AM',
      subject: 'New Subject',
      teacherId: teachers.length > 0 ? teachers[0].id : '',
      teacherName: teachers.length > 0 ? teachers[0].name : '',
      classId: '10th Grade'
    };
    setTeacherTimetable([...teacherTimetable, newEntry]);
  };

  const handleAddStudentRow = () => {
    const newEntry: StudentTimetableEntry = {
      id: `st${Date.now()}`,
      day: 'Monday',
      timeSlot: '08:00 AM - 09:00 AM',
      subject: 'New Subject',
      classId: '10th Grade'
    };
    setStudentTimetable([...studentTimetable, newEntry]);
  };

  const handleDeleteTeacherRow = (index: number) => {
    const updated = [...teacherTimetable];
    updated.splice(index, 1);
    setTeacherTimetable(updated);
  };

  const handleDeleteStudentRow = (index: number) => {
    const updated = [...studentTimetable];
    updated.splice(index, 1);
    setStudentTimetable(updated);
  };

  const handleSaveTeacher = async () => {
    setIsSavingTeacher(true);
    try {
      await saveTeacherTimetable(teacherTimetable);
      toast({ title: "Success", description: "Teacher timetable updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save teacher timetable." });
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleSaveStudent = async () => {
    setIsSavingStudent(true);
    try {
      await saveStudentTimetable(studentTimetable);
      toast({ title: "Success", description: "Class timetable updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save class timetable." });
    } finally {
      setIsSavingStudent(false);
    }
  };

  if (isLoading) {
      return (
        <DashboardLayout role="management">
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        </DashboardLayout>
      );
  }

  return (
    <DashboardLayout role="management">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Timetable Management</h2>
          <p className="text-muted-foreground mt-2">Manage schedules independently for teachers and classes.</p>
        </div>

        <Tabs defaultValue="teacher" className="space-y-4">
            <TabsList>
                <TabsTrigger value="teacher">Teacher Timetable Assignment</TabsTrigger>
                <TabsTrigger value="class">Class Timetable Assignment</TabsTrigger>
            </TabsList>

            <TabsContent value="teacher" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                        <CardTitle className="flex items-center gap-2"><CalendarDays /> Teacher Timetable</CardTitle>
                        <CardDescription>Assign subjects to teachers with specific time slots.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                        <Button onClick={handleAddTeacherRow} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Slot
                        </Button>
                        <Button onClick={handleSaveTeacher} size="sm" disabled={isSavingTeacher}>
                            {isSavingTeacher ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Time Slot</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {teacherTimetable.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No entries found. Click Add Slot to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teacherTimetable.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                    <select 
                                        value={entry.day} 
                                        onChange={(e) => handleTeacherFieldChange(index, 'day', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                    </select>
                                    </TableCell>
                                    <TableCell>
                                    <Input value={entry.timeSlot} onChange={(e) => handleTeacherFieldChange(index, 'timeSlot', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                    <Input value={entry.subject} onChange={(e) => handleTeacherFieldChange(index, 'subject', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                      <select
                                        value={entry.classId || ''}
                                        onChange={(e) => handleTeacherFieldChange(index, 'classId', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <option value="" disabled>Select Class</option>
                                        <option value="10th Grade">10th Grade</option>
                                        <option value="11th Grade">11th Grade</option>
                                        <option value="12th Grade">12th Grade</option>
                                      </select>
                                    </TableCell>
                                    <TableCell>
                                    <select
                                        value={entry.teacherId || ''}
                                        onChange={(e) => {
                                            const selectedTeacherId = e.target.value;
                                            const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
                                            const updated = [...teacherTimetable];
                                            updated[index] = { ...updated[index], teacherId: selectedTeacherId, teacherName: selectedTeacher?.name };
                                            setTeacherTimetable(updated);
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="" disabled>Select a teacher</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    </TableCell>
                                    <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTeacherRow(index)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="class" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                        <CardTitle className="flex items-center gap-2"><CalendarDays /> Class Timetable</CardTitle>
                        <CardDescription>Assign time slots and subjects directly to classes.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                        <Button onClick={handleAddStudentRow} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Slot
                        </Button>
                        <Button onClick={handleSaveStudent} size="sm" disabled={isSavingStudent}>
                            {isSavingStudent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Time Slot</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Class / Section</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {studentTimetable.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No entries found. Click Add Slot to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                studentTimetable.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                    <select 
                                        value={entry.day} 
                                        onChange={(e) => handleStudentFieldChange(index, 'day', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                    </select>
                                    </TableCell>
                                    <TableCell>
                                    <Input value={entry.timeSlot} onChange={(e) => handleStudentFieldChange(index, 'timeSlot', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                    <Input value={entry.subject} onChange={(e) => handleStudentFieldChange(index, 'subject', e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                      <select
                                        value={entry.classId || ''}
                                        onChange={(e) => handleStudentFieldChange(index, 'classId', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="10th Grade">10th Grade</option>
                                        <option value="11th Grade">11th Grade</option>
                                        <option value="12th Grade">12th Grade</option>
                                    </select>
                                    </TableCell>
                                    <TableCell>
                                        <select
                                            value={entry.teacherId || ''}
                                            onChange={(e) => {
                                                const selectedTeacherId = e.target.value;
                                                const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
                                                const updated = [...studentTimetable];
                                                updated[index] = { ...updated[index], teacherId: selectedTeacherId, teacherName: selectedTeacher?.name };
                                                setStudentTimetable(updated);
                                            }}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="" disabled>Select a teacher</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStudentRow(index)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
