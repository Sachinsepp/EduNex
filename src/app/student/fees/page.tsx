
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/authService";
import { getFeesForStudent, payFee, Student, Fee } from "@/lib/services";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FeePaymentPage() {
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'student') {
      setStudent(session.user as Student);
    }
  }, []);

  const fetchFees = async () => {
    if (!student) return;
    setIsLoading(true);
    try {
      const studentFees = await getFeesForStudent(student.id);
      setFees(studentFees);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load fee information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [student]);

  const handlePayment = async (e: React.FormEvent, feeId: string) => {
    e.preventDefault();
    if (!student) return;
    setIsPaying(feeId);

    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await payFee(student.id, feeId);
      toast({
        title: "Payment Successful",
        description: "Your fee has been marked as paid.",
      });
      fetchFees(); // Refresh the fee list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment.",
      });
    } finally {
      setIsPaying(null);
    }
  };

  const totalDue = fees.reduce((acc, fee) => (fee.status === 'Unpaid' ? acc + fee.amount : acc), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
          <CardDescription>An overview of your outstanding and paid fees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${totalDue.toFixed(2)}
          </div>
          <p className="text-muted-foreground">Total amount due</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="flex justify-center items-center col-span-full h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : fees.length > 0 ? (
          fees.map((fee) => (
            <Card key={fee.id}>
              <form onSubmit={(e) => handlePayment(e, fee.id)}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{fee.name}</span>
                    <Badge variant={fee.status === 'Paid' ? 'secondary' : 'destructive'}>
                      {fee.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Due by {fee.dueDate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-semibold">${fee.amount.toFixed(2)}</div>
                  {fee.status === 'Unpaid' && (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`card-number-${fee.id}`}>Card Number</Label>
                        <Input id={`card-number-${fee.id}`} placeholder="**** **** **** 1234" required />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Label htmlFor={`expiry-${fee.id}`}>Expiry</Label>
                          <Input id={`expiry-${fee.id}`} placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor={`cvc-${fee.id}`}>CVC</Label>
                          <Input id={`cvc-${fee.id}`} placeholder="123" required />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {fee.status === 'Paid' ? (
                     <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        <span>Paid Successfully</span>
                    </div>
                  ) : (
                    <Button type="submit" className="w-full" disabled={isPaying === fee.id}>
                      {isPaying === fee.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                      )}
                      {isPaying === fee.id ? "Processing..." : `Pay $${fee.amount.toFixed(2)}`}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">No fees found for this account.</p>
        )}
      </div>
    </div>
  );
}
