
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { loginStudent, getSession } from "@/lib/authService";
import Link from "next/link";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const session = getSession();
    if (session && session.role === 'student') {
      router.push('/student');
    } else {
      setIsCheckingSession(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const student = await loginStudent(email, password);
      if (student) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${student.name}!`,
        });
        router.push("/student");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect email or password.",
        });
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred during login.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">EduNex</h1>
          </Link>
          <p className="mt-2 text-lg text-muted-foreground">Student Portal</p>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                 <GraduationCap className="w-10 h-10 text-primary" />
            </div>
          <CardTitle>Student Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <ArrowRight className="mr-2 w-4 h-4" />}
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
