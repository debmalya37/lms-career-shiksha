// File: app/api/emi/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

const {
  PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION,
  PHONEPE_ENV,
} = process.env;

// Base URLs
const OAUTH_BASE = PHONEPE_ENV === "PRODUCTION"
  ? "https://api.phonepe.com/apis/identity-manager"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const STATUS_BASE = PHONEPE_ENV === "PRODUCTION"
  ? "https://api.phonepe.com/apis/pg"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const OAUTH_URL = `${OAUTH_BASE}/v1/oauth/token`;
const STATUS_URL = (orderId: string) =>
  `${STATUS_BASE}/checkout/v2/order/${orderId}/status?details=false&errorContext=false`;

// OAuth helper
async function getAccessToken() {
  const res = await axios.post(
    OAUTH_URL,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: PHONEPE_CLIENT_ID!,
      client_secret: PHONEPE_CLIENT_SECRET!,
      client_version: PHONEPE_CLIENT_VERSION!,
    } as Record<string, string>),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  
  if (!res.data?.access_token) {
    throw new Error("No access_token in OAuth response");
  }
  return res.data.access_token as string;
}

// Update EMI payment status
async function updateEMIPayment(
  sessionToken: string,
  courseId: string,
  originalTransactionId: string,
  amountPaid: number,
  newTransactionId: string
) {
  await dbConnect();

  const user = await User.findOne({ sessionToken });
  if (!user) return;

  // Find the EMI purchase record
  const purchaseIndex = user.purchaseHistory.findIndex(purchase => 
    purchase.course.toString() === courseId &&
    purchase.transactionId === originalTransactionId &&
    purchase.isEMI &&
    purchase.monthsLeft && 
    purchase.monthsLeft > 0
  );

  if (purchaseIndex === -1) {
    console.error('EMI purchase record not found');
    return;
  }

  const emiPurchase = user.purchaseHistory[purchaseIndex];
  const newMonthsLeft = (emiPurchase.monthsLeft || 1) - 1;

  // Calculate next due date if there are more payments
  let nextDueDate: Date | undefined;
  if (newMonthsLeft > 0) {
    nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }

  // Update the purchase record
  await User.updateOne(
    { 
      sessionToken,
      'purchaseHistory._id': emiPurchase 
    },
    {
      $set: {
        'purchaseHistory.$.monthsLeft': newMonthsLeft,
        'purchaseHistory.$.nextEMIDueDate': nextDueDate,
      }
    }
  );

  // Add a new record for this EMI payment
  await User.updateOne(
    { sessionToken },
    {
      $push: {
        purchaseHistory: {
          course: courseId,
          amount: amountPaid / 100, // Convert paise to rupees
          transactionId: newTransactionId,
          purchasedAt: new Date(),
          promoCode: null,
          isEMI: true,
          totalEMIMonths: emiPurchase.totalEMIMonths,
          monthsLeft: 0, // This is a completed payment
          emiAmount: emiPurchase.emiAmount,
          nextEMIDueDate: undefined, // No next due date for completed payments
        }
      }
    }
  );

  console.log('✅ EMI payment updated successfully:', {
    courseId,
    originalTransactionId,
    newTransactionId,
    monthsLeft: newMonthsLeft,
    amountPaid: amountPaid / 100,
  });
}

// GET handler for EMI payment callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");
  const courseId = searchParams.get("courseId");
  const originalTxn = searchParams.get("originalTxn");
  const sessionToken = searchParams.get("sessionToken");
  
  if (!orderId || !courseId || !originalTxn) {
    return NextResponse.json(
      {
        success: false,
        code: "MISSING_PARAMS",
        message: "id, courseId, and originalTxn required",
      },
      { status: 400 }
    );
  }
  
  // Get OAuth token
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err: any) {
    console.error("OAuth failed:", err);
    return NextResponse.redirect("/payment/failure", 303);
  }
  
  // Check payment status
  let statusRes;
  try {
    statusRes = await axios.get(STATUS_URL(orderId), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
      timeout: 5000,
    });
    console.log("EMI Payment Status response:", statusRes.data);
  } catch (err: any) {
    console.error("Order-Status API error:", err.response?.data || err.message);
    return NextResponse.redirect(`/failure/${orderId}?courseId=${courseId}`, 303);
  }
  
  // Process payment result
  const payload = statusRes.data.data || statusRes.data;
  const { state, amount } = payload;

  if (state === "COMPLETED") {
    // Update EMI payment status
    if (sessionToken) {
      await updateEMIPayment(sessionToken, courseId, originalTxn, amount, orderId);
    }
    
    // Redirect to success page with EMI information
    const successUrl = new URL(
      `/emi/success?courseId=${courseId}&transactionId=${orderId}&originalTxn=${originalTxn}`,
      req.url
    );
    return NextResponse.redirect(successUrl, 303);
  }
  
  // Payment failed
  return NextResponse.redirect(`/emi/failure/${orderId}?courseId=${courseId}`, 303);
}