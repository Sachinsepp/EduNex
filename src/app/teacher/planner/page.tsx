
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, Sparkles } from "lucide-react";
import { getLessonPlan } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export default function LessonPlannerPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !gradeLevel) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both subject and grade level.",
      });
      return;
    }

    setIsLoading(true);
    setLessonPlan("");
    const result = await getLessonPlan({ subject, gradeLevel });
    setIsLoading(false);

    if (result.success) {
      setLessonPlan(result.data.lessonPlanOutline);
    } else {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form onSubmit={handleGeneratePlan}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb /> Lesson Planner</CardTitle>
              <CardDescription>
                Get AI assistance in creating a lesson plan outline. Just provide the subject and grade level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Biology"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Input
                  id="gradeLevel"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="e.g., 9th Grade"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Outline
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[calc(100vh-16rem)]">
          <CardHeader>
            <CardTitle>Generated Outline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lessonPlan ? (
              <Textarea
                value={lessonPlan}
                readOnly
                className="h-[calc(100vh-22rem)] text-base whitespace-pre-wrap"
                placeholder="The generated lesson plan will appear here."
              />
            ) : (
              <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                <p>Your lesson plan outline will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
