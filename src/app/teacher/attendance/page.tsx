
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarCheck, CheckCircle } from "lucide-react";
import { getStudentsForTeacher, saveAttendance, Student, Teacher } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { format } from "date-fns";

type AttendanceState = Record<string, 'Present' | 'Absent' | 'Late'>;

export default function TakeAttendancePage() {
  const { toast } = useToast();
  const [session, setSession] = useState<{ user: Teacher; role: 'teacher' } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession?.role === 'teacher') {
      setSession(currentSession as { user: Teacher; role: 'teacher' });
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const studentsData = await getStudentsForTeacher(session.user.id);
        setStudents(studentsData);
        // Initialize attendance state
        const initialAttendance: AttendanceState = {};
        studentsData.forEach(s => { initialAttendance[s.id] = 'Present' });
        setAttendance(initialAttendance);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load student list." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [session, toast]);

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
      date: today
    }));

    try {
      await saveAttendance(records);
      toast({
        title: "Attendance Saved",
        description: `Attendance for ${format(new Date(), "MMMM d, yyyy")} has been recorded.`
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save attendance." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CalendarCheck/> Take Attendance</CardTitle>
        <CardDescription>Mark the attendance for your students for today, {format(new Date(), "eeee, MMMM d, yyyy")}.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleAttendanceSubmit} className="space-y-6">
            {students.length > 0 ? (
                students.map(student => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border p-4">
                    <p className="font-medium">{student.name}</p>
                    <RadioGroup
                      value={attendance[student.id]}
                      onValueChange={(value: 'Present' | 'Absent' | 'Late') => handleAttendanceChange(student.id, value)}
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Present" id={`${student.id}-present`} />
                        <Label htmlFor={`${student.id}-present`}>Present</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Late" id={`${student.id}-late`} />
                        <Label htmlFor={`${student.id}-late`}>Late</Label>
                      </div>
                       <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Absent" id={`${student.id}-absent`} />
                        <Label htmlFor={`${student.id}-absent`}>Absent</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">You have no students assigned to you.</p>
            )}
            
            {students.length > 0 && (
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Submit Attendance
                    </Button>
                </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
