
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Bot, User, MessageSquare } from "lucide-react";
import { getTutorResponse } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Course, Student, getCoursesForStudent } from "@/lib/services";
import { getSession } from "@/lib/authService";

type ChatMessage = {
    author: "user" | "bot";
    message: string;
};

export default function AiTutorPage() {
    const { toast } = useToast();
    const [session, setSession] = useState<{ user: Student; role: 'student' } | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const currentSession = getSession();
        if (currentSession?.role === 'student') {
            setSession(currentSession as { user: Student; role: 'student' });
        }
    }, []);
    
    useEffect(() => {
        const fetchCourses = async () => {
            if (!session) return;
            setIsLoadingCourses(true);
            try {
                const coursesData = await getCoursesForStudent(session.user.id);
                setCourses(coursesData);
                 if (coursesData.length > 0) {
                    setSelectedTopic(coursesData[0].title);
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load courses." });
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [session, toast]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !selectedTopic) return;

        const newUserMessage: ChatMessage = { author: "user", message: userInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserInput("");
        setIsThinking(true);

        const historyForApi = chatHistory.map(c => ({
            role: c.author === 'user' ? 'user' : 'model',
            content: c.message
        }));

        const result = await getTutorResponse({
            question: userInput,
            topic: selectedTopic,
            history: historyForApi
        });

        setIsThinking(false);

        if (result.success) {
            const newBotMessage: ChatMessage = { author: "bot", message: result.data.answer };
            setChatHistory(prev => [...prev, newBotMessage]);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
            const errorBotMessage: ChatMessage = { author: "bot", message: "Sorry, I ran into an error. Please try again." };
            setChatHistory(prev => [...prev, errorBotMessage]);
        }
    };
    
    return (
        <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare /> AI Tutor</CardTitle>
                <CardDescription>Your personal AI assistant. Select a course topic and ask a question.</CardDescription>
                 <Select onValueChange={setSelectedTopic} value={selectedTopic} disabled={isLoadingCourses}>
                    <SelectTrigger className="mt-4">
                        <SelectValue placeholder="Select a topic to discuss..." />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoadingCourses ? (
                            <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                        ) : (
                            courses.map(course => <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>)
                        )}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-muted-foreground pt-16">
                                <p>Ask me anything about "{selectedTopic || 'your selected course'}"!</p>
                            </div>
                        )}
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex items-start gap-3 ${chat.author === "user" ? "justify-end" : ""}`}>
                                {chat.author === "bot" && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-lg p-3 ${chat.author === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                                </div>
                                {chat.author === "user" && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isThinking && (
                            <div className="flex items-start gap-3">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-3 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4">
                    <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={!selectedTopic || isThinking}
                    />
                    <Button type="submit" disabled={!selectedTopic || isThinking || !userInput.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
