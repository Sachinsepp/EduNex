
"use client";

import { useState, useEffect } from "react";
import { getStudentsForTeacher, getCoursesForTeacher, getPendingReviewsForTeacher, Teacher, Student, Course, QuizResultRecord } from "@/lib/services";
import { useSession } from "@/hooks/use-session";
import { PageHeader, Section, Grid, QuickActionsGrid } from "@/components/layout";
import { PageLoader } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/stat-card";
import { Users, BookOpen, BarChart3, CalendarCheck, Lightbulb, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeacherDashboardPage() {
  const { session, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingReviews, setPendingReviews] = useState<QuizResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [coursesDialogOpen, setCoursesDialogOpen] = useState(false);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session || session.role !== 'teacher') return;
      
      setIsLoading(true);
      try {
        const [studentsData, coursesData, reviewsData] = await Promise.all([
          getStudentsForTeacher(session.user.id),
          getCoursesForTeacher(session.user.id),
          getPendingReviewsForTeacher(session.user.id)
        ]);
        setStudents(studentsData);
        setCourses(coursesData);
        setPendingReviews(reviewsData);
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
      fetchData();
    }
  }, [session, toast]);

  if (isSessionLoading || isLoading || !session) {
    return <PageLoader text="Loading dashboard..." />;
  }

  const teacherSession = session as { user: Teacher; role: 'teacher' };

  const quickActions = [
    { href: "/teacher/attendance", label: "Take Attendance", icon: CalendarCheck },
    { href: "/teacher/planner", label: "Lesson Planner", icon: Lightbulb },
    { href: "/teacher/quiz-gen", label: "Generate Quiz", icon: HelpCircle },
    { href: "/teacher/analytics", label: "View Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${teacherSession.user.name}!`}
        description="Here's a quick overview of your classroom."
      />

      <Section>
        <Grid cols={3}>
          <StatCard
            title="My Students"
            value={students.length}
            icon={Users}
            onClick={() => setStudentsDialogOpen(true)}
          />
          <StatCard
            title="My Courses"
            value={courses.length}
            icon={BookOpen}
            onClick={() => setCoursesDialogOpen(true)}
          />
          <StatCard
            title="Pending Reviews"
            value={pendingReviews.length}
            description="From recent quiz submissions"
            icon={BarChart3}
            onClick={() => setReviewsDialogOpen(true)}
          />
        </Grid>
      </Section>

      <Section title="Quick Actions">
        <QuickActionsGrid actions={quickActions} />
      </Section>

      {/* Students Dialog */}
      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Students</DialogTitle>
            <DialogDescription>Students assigned to you</DialogDescription>
          </DialogHeader>
          {students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students yet"
              description="You don't have any students assigned yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Courses Dialog */}
      <Dialog open={coursesDialogOpen} onOpenChange={setCoursesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Courses</DialogTitle>
            <DialogDescription>Courses you are teaching</DialogDescription>
          </DialogHeader>
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description="You don't have any courses assigned yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Modules</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.description}</TableCell>
                    <TableCell>{course.modules.join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog */}
      <Dialog open={reviewsDialogOpen} onOpenChange={setReviewsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pending Reviews</DialogTitle>
            <DialogDescription>Quiz submissions waiting for review</DialogDescription>
          </DialogHeader>
          {pendingReviews.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No pending reviews"
              description="All quiz submissions have been reviewed."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review, index) => (
                  <TableRow key={`${review.studentId}-${review.courseId}-${index}`}>
                    <TableCell className="font-medium">{review.studentId}</TableCell>
                    <TableCell>{review.courseId}</TableCell>
                    <TableCell>{review.score}/{review.total}</TableCell>
                    <TableCell>{new Date(review.takenAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
