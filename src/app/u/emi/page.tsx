"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, CreditCard } from "lucide-react";

interface EMIData {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    courseImg?: string;
  };
  totalAmount: number;
  emiAmount: number;
  totalEMIMonths: number;
  monthsLeft: number;
  nextEMIDueDate: string;
  status: "active" | "completed" | "overdue" | "cancelled";
}

export default function UserEMIPage() {
  const [emis, setEmis] = useState<EMIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEMIs() {
      try {
        const res = await fetch("/api/emi/user"); // API to get logged-in user's EMIs
        const data = await res.json();
        setEmis(data);
      } catch (err) {
        console.error("Error fetching EMIs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEMIs();
  }, []);

  const today = new Date();

  // 🔹 Pay Now handler with safe parsing
  const handlePayNow = async (emi: EMIData) => {
    try {
      setPayingId(emi._id);
  
      const res = await fetch("/api/initiatePayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emiId: emi._id,                // ✅ identify existing EMI record
          amount: emi.emiAmount,
          courseId: emi.courseId._id,
          isEMI: true,
          emiMonths: emi.totalEMIMonths,
          totalAmount: emi.totalAmount,
        }),
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }
  
      const data = await res.json();
      const redirect =
        data.redirectUrl ??
        data.redirect ??
        data.data?.instrumentResponse?.redirectInfo?.url;
  
      if (redirect) {
        window.location.href = redirect;
      } else {
        alert("Payment initiation failed: Invalid response");
      }
    } catch (err: any) {
      console.error("Pay Now failed", err);
      alert("Something went wrong: " + err.message);
    } finally {
      setPayingId(null);
    }
  };
  

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📑 My EMI Plans</h1>

      {loading ? (
        <p>Loading EMIs...</p>
      ) : emis.length === 0 ? (
        <p className="text-gray-500">You don’t have any active EMIs.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emis.map((emi) => {
            const dueDate = new Date(emi.nextEMIDueDate);
            const daysLeft = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const progress =
              ((emi.totalEMIMonths - emi.monthsLeft) / emi.totalEMIMonths) * 100;

            return (
              <Card
                key={emi._id}
                className="flex flex-col justify-between shadow-md hover:shadow-lg transition"
              >
                <CardHeader className="flex items-center gap-3">
                  <img
                    src={emi.courseId.courseImg || "/placeholder.png"}
                    alt={emi.courseId.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <CardTitle className="text-lg">
                    {emi.courseId.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Total Amount: ₹{emi.totalAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      EMI: ₹{emi.emiAmount} × {emi.totalEMIMonths} months
                    </p>
                    <Progress value={progress} className="h-2" />

                    <div className="flex items-center gap-2 text-sm mt-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        Next Due:{" "}
                        <span
                          className={`${
                            daysLeft <= 7
                              ? "text-red-600 font-semibold"
                              : "text-gray-800"
                          }`}
                        >
                          {dueDate.toDateString()} ({daysLeft} days left)
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          emi.status === "active"
                            ? "bg-green-100 text-green-700"
                            : emi.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {emi.status.toUpperCase()}
                      </span>

                      {emi.status === "active" && (
                        <Button
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handlePayNow(emi)}
                          disabled={payingId === emi._id}
                        >
                          <CreditCard className="h-4 w-4" />
                          {payingId === emi._id ? "Processing..." : "Pay Now"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
