import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OfflineEMI from "@/models/offlineEmiModel";

export async function GET() {
  await connectDB();
  const emis = await OfflineEMI.find();
  return NextResponse.json(emis.map((e) => e.toJSON())); // ✅ ensures virtuals appear
}


export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  const totalAmount = Number(data.totalAmount) || 0;
  const monthlyEmiAmount = Number(data.monthlyEmiAmount) || 0;
  const emisPaidMonths = Number(data.emisPaidMonths) || 0;
  const monthlyEmiDate = Number(data.monthlyEmiDate) || 1; // default 1st of month

  // derive total EMIs in months
  const totalEmis = monthlyEmiAmount > 0 ? Math.ceil(totalAmount / monthlyEmiAmount) : 0;

  const emisLeft = totalEmis - emisPaidMonths;
  const totalEmiPaid = emisPaidMonths * monthlyEmiAmount;
  const totalEmiDue = emisLeft * monthlyEmiAmount;
  const status = emisLeft <= 0 ? "completed" : "pending";

  // ✅ calculate next EMI date (always fixed monthly, irrespective of paid months)
  let nextEmiDate: string | null = null;
  if (emisLeft > 0) {
    const today = new Date();
    const next = new Date(today);

    // set to EMI day of current month
    next.setDate(monthlyEmiDate);

    // if today is past this month’s EMI date, move to next month
    if (next <= today) {
      next.setMonth(next.getMonth() + 1);
    }

    nextEmiDate = next.toISOString();
  }

  // ✅ build EMI schedule (fixed monthly dates)
  const emiSchedule = Array.from({ length: totalEmis }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    d.setDate(monthlyEmiDate);
    return {
      date: d.toISOString(),
      paid: i < emisPaidMonths,
    };
  });

  const newEmi = await OfflineEMI.create({
    ...data,
    totalAmount,
    totalEmis,
    emisPaidMonths,
    monthlyEmiAmount,
    emisLeft,
    totalEmiPaid,
    totalEmiDue,
    monthlyEmiDate,
    nextEmiDate,
    emiSchedule,
    status,
  });

  return NextResponse.json(newEmi, { status: 201 });
}
