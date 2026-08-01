
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, LogOut, Settings, User, Loader2 } from "lucide-react";
import { logout, getSession } from "@/lib/authService";
import { useEffect, useState } from "react";

type DashboardPageProps = {
  children: React.ReactNode;
  title: string;
  role: "Management" | "Teacher" | "Student";
};

type Session = {
  user: { name: string; email: string };
  role: 'student' | 'teacher';
} | null;

export function DashboardPage({ children, title, role }: DashboardPageProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // getSession is synchronous and reads from localStorage
    const currentSession = getSession();
    
    if (role === "Management") {
      setIsLoading(false);
      return;
    }

    if (!currentSession || currentSession.role !== role.toLowerCase()) {
        logout();
        router.push(role === "Student" ? "/student/login" : "/teacher/login");
    } else {
        setSession(currentSession as Session);
        setIsLoading(false);
    }
  }, [role, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getProfileLink = () => {
    if (role === "Student") return "/profile/student";
    if (role === "Teacher") return "/profile/teacher";
    return "/";
  }

  const getSettingsLink = () => {
    if (role === "Student") return "/settings/student";
    if (role === "Teacher") return "/settings/teacher";
    return "/";
  }
  
  if (isLoading) {
    return (
       <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">EduNex</span>
          </Link>
          <span className="hidden sm:inline text-sm font-medium text-muted-foreground">| {role}</span>
        </div>

        <div className="flex items-center gap-2">
           <Link href="/">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
           </Link>
           {role !== "Management" ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${session?.user?.name?.charAt(0)}`} alt="User" data-ai-hint="user avatar" />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || role.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name || `${role} User`}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email || `${role.toLowerCase()}@edunex.com`}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href={getProfileLink()}><User className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href={getSettingsLink()}><Settings className="mr-2 h-4 w-4" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
           )}
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in-25 duration-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </>
  );
}
