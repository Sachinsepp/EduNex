
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Book,
  Home,
  LogOut,
  Settings,
  User,
  Shield,
  BookUser,
  GraduationCap,
  LayoutDashboard,
  HelpCircle,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Lightbulb,
  CreditCard,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSession, logout } from "@/lib/authService";
import type { Student, Teacher } from "@/lib/services";

type Session = {
  user: Student | Teacher;
  role: "student" | "teacher";
} | null;

type DashboardLayoutProps = {
  children: React.ReactNode;
  role: "student" | "teacher" | "management";
};

const navItems = {
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/student/quizzes", label: "Quizzes", icon: HelpCircle },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/student/tutor", label: "AI Tutor", icon: MessageSquare },
    { href: "/student/fees", label: "Fee Payment", icon: CreditCard },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/timetable", label: "Timetable", icon: CalendarDays },
    {
      href: "/teacher/attendance",
      label: "Take Attendance",
      icon: CalendarCheck,
    },
    { href: "/teacher/planner", label: "Lesson Planner", icon: Lightbulb },
    { href: "/teacher/quiz-gen", label: "Quiz Generator", icon: HelpCircle },
    {
      href: "/teacher/analytics",
      label: "Student Analytics",
      icon: BarChart3,
    },
  ],
  management: [
    { href: "/management", label: "Dashboard", icon: Shield },
    { href: "/management/timetable", label: "Manage Timetable", icon: CalendarDays },
  ],
};

const roleDetails = {
  student: {
    name: "Student",
    icon: GraduationCap,
    profileLink: "/profile/student",
    settingsLink: "/settings/student",
    loginLink: "/student/login",
  },
  teacher: {
    name: "Teacher",
    icon: BookUser,
    profileLink: "/profile/teacher",
    settingsLink: "/settings/teacher",
    loginLink: "/teacher/login",
  },
  management: {
    name: "Management",
    icon: Shield,
    profileLink: "#",
    settingsLink: "#",
    loginLink: "/",
  },
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentRoleDetails = roleDetails[role];

  useEffect(() => {
    if (role === "management") {
      setIsLoading(false);
      return;
    }

    const currentSession = getSession();
    if (!currentSession || currentSession.role !== role) {
      logout(); // Clear any invalid session
      router.push(currentRoleDetails.loginLink);
    } else {
      setSession(currentSession as Session);
      setIsLoading(false);
    }
  }, [role, router, currentRoleDetails.loginLink]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const currentNavItems = navItems[role];

  const pageTitle = useMemo(() => {
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';

    const activeItem = currentNavItems.find(item => pathname === item.href);
    return activeItem?.label || roleDetails[role].name + " Dashboard";
  }, [pathname, currentNavItems, role]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <currentRoleDetails.icon className="w-6 h-6" />
              <span className="group-data-[collapsible=icon]:hidden">
                EduNex
              </span>
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {currentNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={currentRoleDetails.profileLink}>
                <SidebarMenuButton tooltip={{children: "Profile"}} isActive={pathname.startsWith('/profile')}>
                  <User />
                  <span>Profile</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href={currentRoleDetails.settingsLink}>
                <SidebarMenuButton tooltip={{children: "Settings"}} isActive={pathname.startsWith('/settings')}>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Logout"}}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{session?.user?.name}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://placehold.co/100x100.png?text=${session?.user?.name?.charAt(0)}`}
                alt="User"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || role.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in-25 duration-300">
           <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
