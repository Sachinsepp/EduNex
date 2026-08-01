"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Loader2 } from "lucide-react";
import { getTeacherTimetable, TeacherTimetableEntry } from "@/lib/services";
import { getSession } from "@/lib/authService";

export default function TeacherTimetablePage() {
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TeacherTimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      const session = getSession();
      const mappedTeacherId = session?.user?.id;
      const data = await getTeacherTimetable(mappedTeacherId);
      setTimetable(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load timetable." });
    } finally {
      setIsLoading(false);
    }
  };

  // Group by day for a nicer view, or just show flat
  const grouped = timetable.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = [];
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, TeacherTimetableEntry[]>);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><CalendarDays /> Weekly Timetable</CardTitle>
             <CardDescription>View your schedule for the week.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : timetable.length === 0 ? (
               <p className="text-muted-foreground text-center py-8">No timetable scheduled yet.</p>
            ) : (
               <div className="space-y-8">
                 {daysOrder.map(day => {
                    const dayEntries = grouped[day] || [];
                    if (dayEntries.length === 0) return null;
                    
                    return (
                        <div key={day}>
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">{day}</h3>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Time Slot</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Class</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dayEntries.map(entry => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                <Badge variant="outline">{entry.timeSlot}</Badge>
                                            </TableCell>
                                            <TableCell>{entry.subject}</TableCell>
                                            <TableCell>{entry.classId || 'Not Assigned'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    );
                 })}
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
