
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BookUser, GraduationCap, ArrowRight } from "lucide-react";
import { ManagementLoginDialog } from "@/components/auth/login-dialog";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const roles = [
    {
      name: "Management",
      description: "Full access to manage users, courses, and system settings.",
      icon: <Shield className="w-10 h-10 text-primary" />,
      action: () => setIsDialogOpen(true),
      isLink: false,
    },
    {
      name: "Teacher",
      description: "Manage students, create lesson plans, and generate quizzes.",
      icon: <BookUser className="w-10 h-10 text-primary" />,
      href: "/teacher/login",
      isLink: true,
    },
    {
      name: "Student",
      description: "Access course materials, take quizzes, and get feedback.",
      icon: <GraduationCap className="w-10 h-10 text-primary" />,
      href: "/student/login",
      isLink: true,
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary tracking-tight">EduNex</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            An AI-powered education platform for students and teachers, providing intelligent tutoring, quiz generation, and personalized learning experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {roles.map((role) => {
            const cardContent = (
              <Card className="text-center h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
                <CardHeader>
                  <div className="flex justify-center mb-4">{role.icon}</div>
                  <CardTitle className="text-2xl font-semibold">{role.name}</CardTitle>
                  <CardDescription className="mt-2 h-12">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full" onClick={role.isLink ? undefined : role.action}>
                    Proceed as {role.name} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );

            return role.isLink ? (
              <Link href={role.href!} key={role.name} className="h-full">
                {cardContent}
              </Link>
            ) : (
              <div key={role.name} className="cursor-pointer" onClick={role.action}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
      <ManagementLoginDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
