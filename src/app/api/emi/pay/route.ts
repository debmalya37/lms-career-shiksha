// File: app/api/emi/pay/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';
import Course from '@/models/courseModel';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const {
  PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION,
  PHONEPE_ENV,
} = process.env;

const BASE = PHONEPE_ENV === 'PRODUCTION'
  ? 'https://api.phonepe.com/apis/identity-manager'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const OAUTH_URL = `${BASE}/v1/oauth/token`;
const PAY_URL = PHONEPE_ENV === 'PRODUCTION'
  ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

// Get pending EMI payments for a user
export async function GET(req: NextRequest) {
  await connectMongo();
  
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await User.findOne({ sessionToken });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Find all EMI purchases with remaining payments
  const pendingEMIs = user.purchaseHistory.filter(purchase => 
    purchase.isEMI && 
    purchase.monthsLeft && 
    purchase.monthsLeft > 0
  );

  // Enrich with course information
  const enrichedEMIs = await Promise.all(
    pendingEMIs.map(async (emi) => {
      const course = await Course.findById(emi.course).lean();
      return {
        _id: emi.course,
        courseName: course || 'Unknown Course',
        monthsLeft: emi.monthsLeft,
        emiAmount: emi.emiAmount,
        nextDueDate: emi.nextEMIDueDate,
        totalEMIMonths: emi.totalEMIMonths,
        originalTransactionId: emi.transactionId,
      };
    })
  );

  return NextResponse.json({ pendingEMIs: enrichedEMIs });
}

// Process EMI payment
export async function POST(req: NextRequest) {
  let payload: { courseId?: string; transactionId?: string };
  
  try {
    payload = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { courseId, transactionId } = payload;
  
  if (!courseId || !transactionId) {
    return NextResponse.json(
      { error: 'Missing courseId or transactionId' },
      { status: 400 }
    );
  }

  await connectMongo();
  
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await User.findOne({ sessionToken });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Find the specific EMI purchase record
  const emiPurchase = user.purchaseHistory.find(purchase => 
    purchase.course.toString() === courseId &&
    purchase.transactionId === transactionId &&
    purchase.isEMI &&
    purchase.monthsLeft && 
    purchase.monthsLeft > 0
  );

  if (!emiPurchase) {
    return NextResponse.json(
      { error: 'EMI record not found or already completed' },
      { status: 404 }
    );
  }

  // Get OAuth token
  let accessToken: string;
  try {
    const authRes = await axios.post(
      OAUTH_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PHONEPE_CLIENT_ID!,
        client_secret: PHONEPE_CLIENT_SECRET!,
        client_version: PHONEPE_CLIENT_VERSION!,
      } as Record<string, string>),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    accessToken = authRes.data.access_token;
    if (!accessToken) throw new Error('No access_token');
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Auth failed', details: e.response?.data || e.message },
      { status: 502 }
    );
  }

  // Create new payment order
  const merchantOrderId = `EMI-${uuidv4().slice(-8)}`;
  const redirectUrl = `https://civilacademyapp.com/api/emi/callback?id=${merchantOrderId}&courseId=${courseId}&originalTxn=${transactionId}&sessionToken=${sessionToken}`;

  const remainingInstallments = emiPurchase?.monthsLeft;
  const currentInstallment = (emiPurchase.totalEMIMonths || 0) - (remainingInstallments || 0) + 1;

  const body = {
    merchantOrderId,
    amount: Math.round((emiPurchase.emiAmount || 0) * 100), // Convert to paise
    expireAfter: 1200,
    metaInfo: {
      udf1: `course-${courseId}`,
      udf2: `user-${user._id}`,
      udf3: `emi-payment`,
      udf4: `installment-${currentInstallment}`,
      udf5: `original-${transactionId}`,
    },
    paymentFlow: {
      type: 'PG_CHECKOUT',
      message: `EMI Payment - Installment ${currentInstallment} of ${emiPurchase.totalEMIMonths}`,
      merchantUrls: { redirectUrl },
    },
  };

  // Initiate payment
  try {
    const resp = await axios.post(PAY_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `O-Bearer ${accessToken}`,
      },
    });

    const top = resp.data;
    const nested = top.data;
    const orderId = (nested && nested.orderId) || top.orderId || top.data?.orderId;
    const redirect = 
      (nested && nested.instrumentResponse?.redirectInfo?.url) ||
      top.redirectUrl ||
      top.data?.redirectUrl;

    if (!orderId || !redirect) {
      throw new Error('Malformed pay response');
    }

    return NextResponse.json({ orderId, redirectUrl: redirect });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Payment initiation failed', details: e.response?.data || e.message },
      { status: 502 }
    );
  }
}