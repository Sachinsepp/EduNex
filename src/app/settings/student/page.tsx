"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, Palette, Lock, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export default function StudentSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
      <form onSubmit={handleSaveChanges}>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette /> Theme</CardTitle>
              <CardDescription>Choose how EduNex looks and feels.</CardDescription>
            </CardHeader>
            <CardContent>
              {mounted && (
                <div className="grid grid-cols-3 gap-4">
                  <Button variant={theme === "light" ? "default" : "outline"} className="flex flex-col h-auto py-4" type="button" onClick={() => setTheme("light")}>
                    <Sun className="mb-2" /> Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} className="flex flex-col h-auto py-4" type="button" onClick={() => setTheme("dark")}>
                    <Moon className="mb-2" /> Dark
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} className="flex flex-col h-auto py-4" type="button" onClick={() => setTheme("system")}>
                    <Monitor className="mb-2" /> System
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications from the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about grades and announcements via email.</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified directly on your device. (Simulated)</p>
                </div>
                <Switch id="push-notifications" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock /> Account</CardTitle>
              <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
               <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
             <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
  );
}
