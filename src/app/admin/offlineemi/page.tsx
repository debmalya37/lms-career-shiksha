"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";

interface OfflineEMI {
  _id: string;
  studentName: string;
  studentAddress: string;
  centerAddress: string;
  totalAmount: number; 
  courseName: string;   // ✅ added
  totalEmis: number;
  emisPaidMonths: number;
  emisLeft: number;
  monthlyEmiAmount: number;
  totalEmiPaid: number;
  totalEmiDue: number;
  monthlyEmiDate: number;
  nextEmiDate?: string;
  status: "pending" | "completed";
  emiSchedule?: { date: string; paid: boolean }[];
}

export default function OfflineEMIPage() {
  const [emis, setEmis] = useState<OfflineEMI[]>([]);
  const [form, setForm] = useState<Partial<OfflineEMI>>({});
  const [loading, setLoading] = useState(false);

  const fetchEmis = async () => {
    const res = await fetch("/api/offlineemi");
    const data = await res.json();
    setEmis(data);
  };

  useEffect(() => {
    fetchEmis();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };
  

  // inside OfflineEMIPage component

const handleMarkPaid = async (emiId: string, scheduleIndex: number) => {
  // find the EMI
  const emi = emis.find((e) => e._id === emiId);
  if (!emi || !emi.emiSchedule) return;

  // prevent double-marking
  if (emi.emiSchedule[scheduleIndex].paid) return;

  // update schedule locally
  const updatedSchedule = [...emi.emiSchedule];
  updatedSchedule[scheduleIndex].paid = true;

  // recalc paid months, left EMIs, total paid, total due, status
  const newEmisPaidMonths = updatedSchedule.filter((s) => s.paid).length;
  const newEmisLeft = emi.totalEmis - newEmisPaidMonths;
  const newTotalEmiPaid = newEmisPaidMonths * emi.monthlyEmiAmount;
  const newTotalEmiDue = newEmisLeft * emi.monthlyEmiAmount;
  const newStatus = newEmisLeft <= 0 ? "completed" : "pending";

  const updatedData = {
    emiSchedule: updatedSchedule,
    emisPaidMonths: newEmisPaidMonths,
    emisLeft: newEmisLeft,
    totalEmiPaid: newTotalEmiPaid,
    totalEmiDue: newTotalEmiDue,
    status: newStatus,
  };

  // send PUT request to API
  await fetch(`/api/offlineemi/${emiId}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
    headers: { "Content-Type": "application/json" },
  });

  // update local state
  setEmis((prev) =>
      prev.map((e) => (e._id === emiId ? { ...e, ...updatedData } as OfflineEMI : e))
    );
};


  const handleAdd = async () => {
    setLoading(true);
    await fetch("/api/offlineemi", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    setForm({});
    setLoading(false);
    fetchEmis();
  };

  const isNearDue = (nextEmiDate?: string) => {
    if (!nextEmiDate) return false;
    const nextDate = new Date(nextEmiDate);
    const today = new Date();
    const diff = (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3;
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Offline EMI Management</h1>

      {/* Add Student EMI Form */}
      <Card className="p-4">
        <CardHeader className="font-semibold flex items-center gap-2">
          Add Offline EMI Student
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Student Name" name="studentName" value={form.studentName || ""} onChange={handleChange} />
          <Input placeholder="Student Address" name="studentAddress" value={form.studentAddress || ""} onChange={handleChange} />
          <Input placeholder="Center Address" name="centerAddress" value={form.centerAddress || ""} onChange={handleChange} />
          <Input placeholder="Course Name" name="courseName" value={form.courseName || ""} onChange={handleChange} /> {/* ✅ */}
          <Input type="number" placeholder="Total Amount" name="totalAmount" value={form.totalAmount || ""} onChange={handleChange} />
<Input type="number" placeholder="Monthly EMI Amount" name="monthlyEmiAmount" value={form.monthlyEmiAmount || ""} onChange={handleChange} />
<Input type="number" placeholder="Paid Months" name="emisPaidMonths" value={form.emisPaidMonths || ""} onChange={handleChange} />

          <Input type="number" placeholder="Monthly EMI Date (1-31)" name="monthlyEmiDate" value={form.monthlyEmiDate || ""} onChange={handleChange} />
          <Button onClick={handleAdd} disabled={loading} className="col-span-2">
            {loading ? "Saving..." : "Add Student"}
          </Button>
        </CardContent>
      </Card>

      {/* EMI List */}
      <div className="space-y-4">
        {emis.map((emi) => (
          <Card key={emi._id} className="shadow-md">
            <CardHeader className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{emi.studentName}</h2>
                <p className="text-sm text-gray-500">{emi.studentAddress}</p>
                <p className="text-sm text-indigo-600">Course: {emi.courseName}</p> {/* ✅ show course */}
              </div>
              {emi.status === "completed" ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" /> Completed
                </div>
              ) : (
                <div className="flex items-center text-yellow-600 text-sm">
                  <Clock className="w-4 h-4 mr-1" /> Pending
                </div>
              )}
              {isNearDue(emi.nextEmiDate) && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" /> EMI due soon!
                </div>
              )}
            </CardHeader>
            <CardContent className="grid gap-2">
              <p><strong>Center:</strong> {emi.centerAddress}</p>
              <p><strong>Total EMIs:</strong> {emi.totalEmis}</p>
              <p><strong>Paid Months:</strong> {emi.emisPaidMonths}</p>
              <p><strong>Remaining Months:</strong> {emi.emisLeft}</p>
              <p><strong>Monthly EMI:</strong> ₹{emi.monthlyEmiAmount}</p>
              <p><strong>Paid:</strong> ₹{emi.totalEmiPaid}</p>
              <p><strong>Due:</strong> ₹{emi.totalEmiDue}</p>
              <p className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Next EMI:{" "}
                {emi.nextEmiDate ? new Date(emi.nextEmiDate).toDateString() : "N/A"}
              </p>

              {/* EMI Schedule */}
              {emi.emiSchedule && (
  <div className="mt-2">
    <h3 className="font-medium">EMI Schedule:</h3>
    <ul className="grid md:grid-cols-3 gap-2 mt-1">
      {emi.emiSchedule.map((sch, i) => (
        <li
          key={i}
          className={`p-2 rounded text-sm flex justify-between items-center ${
            sch.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span>{new Date(sch.date).toDateString()}</span>
          {!sch.paid && (
            <button
              onClick={() => handleMarkPaid(emi._id, i)}
              className="ml-2 bg-green-500 text-white rounded px-2 py-0.5 text-xs"
            >
              ✓ Mark Paid
            </button>
          )}
          {sch.paid && <span className="text-green-600 font-semibold">Paid</span>}
        </li>
      ))}
    </ul>
  </div>
)}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
