// app/api/invoices/route.ts
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Invoice from '@/models/invoiceModel';
import Course, { ICourse } from '@/models/courseModel';
import preAdmissionModel, { IPreAdmission } from '@/models/preAdmissionModel';

export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const email = searchParams.get('email');

  const query: any = {};
  if (month) {
    const [y, m] = month.split('-').map(Number);
    query.createdAt = {
      $gte: new Date(y, m - 1, 1),
      $lt:  new Date(y, m, 1),
    };
  }
  if (email) {
    query.email = email;
  }

  try {
    const invoices = await Invoice.find(query)
      .sort('-createdAt')
      .lean();
    const gstTotal = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    return NextResponse.json({ invoices, gstTotal });
  } catch (err) {
    console.error("Failed to fetch invoices:", err);
    return NextResponse.json(
      { error: 'Could not fetch invoices' },
      { status: 500 }
    );
  }
}
