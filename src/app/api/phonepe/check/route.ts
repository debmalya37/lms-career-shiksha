// File: app/api/phonepe/check/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import Course from "@/models/courseModel";

const {
  PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION,
  PHONEPE_ENV,
} = process.env;

if (
  !PHONEPE_CLIENT_ID ||
  !PHONEPE_CLIENT_SECRET ||
  !PHONEPE_CLIENT_VERSION
) {
  throw new Error(
    "Missing one of PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_VERSION"
  );
}

// ── 1) Base URLs ────────────────────────────────────────────────────────────────
const OAUTH_BASE = PHONEPE_ENV === "PRODUCTION"
  ? "https://api.phonepe.com/apis/identity-manager"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const STATUS_BASE = PHONEPE_ENV === "PRODUCTION"
  ? "https://api.phonepe.com/apis/pg"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// full URLs
const OAUTH_URL  = `${OAUTH_BASE}/v1/oauth/token`;
const STATUS_URL = (orderId: string) =>
  `${STATUS_BASE}/checkout/v2/order/${orderId}/status?details=false&errorContext=false`;

// ── 2) OAuth helper ────────────────────────────────────────────────────────────
async function getAccessToken() {
  const res = await axios.post(
    OAUTH_URL,
    new URLSearchParams({
      grant_type:     "client_credentials",
      client_id:      PHONEPE_CLIENT_ID!,
      client_secret:  PHONEPE_CLIENT_SECRET!,
      client_version: PHONEPE_CLIENT_VERSION!,
    } as Record<string, string>),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  if (!res.data?.access_token) {
    throw new Error("No access_token in OAuth response");
  }
  return res.data.access_token as string;
}

// ── 3) Enhanced Enrollment helper with EMI support ─────────────────────────────
async function enrollUser(
  sessionToken: string,
  courseId: string,
  amountPaid: number,
  orderId: string,
  metaInfo: any
) {
  await dbConnect();

  const user = await User.findOne({ sessionToken });
  if (!user) return;

  // Extract EMI information from metaInfo
  const promoCode = metaInfo?.udf3 || null;
  const isEMI = metaInfo?.udf4 === 'true';
  const emiMonths = isEMI ? parseInt(metaInfo?.udf5 || '0') : undefined;
  const totalAmountPaise = isEMI ? parseInt(metaInfo?.udf6 || '0') : undefined;

  // Combine existing + new course IDs
  const courseIds = new Set<string>([...user.course.map(c => c.toString()), courseId]);

  // Fetch all relevant courses
  const courses = await Course.find({ _id: { $in: Array.from(courseIds) } }).lean();

  let maxDays = 0;
  let hasMissingDuration = false;

  for (const c of courses) {
    if (typeof c.duration !== "number" || isNaN(c.duration)) {
      hasMissingDuration = true;
      break;
    }
    maxDays = Math.max(maxDays, c.duration);
  }

  // If any course is missing duration, default to 5 years (1825 days)
  if (hasMissingDuration) {
    maxDays = 365 * 5;
  }

  let amountInRupees = amountPaid / 100; // Convert paise to rupees

  // Create purchase record with EMI information
  const purchaseRecord: any = {
    course: courseId,
    amount: amountInRupees,
    transactionId: orderId,
    purchasedAt: new Date(),
    promoCode: promoCode,
    isEMI: isEMI,
  };

  // Add EMI-specific fields if this is an EMI purchase
  if (isEMI && emiMonths && totalAmountPaise) {
    const totalAmountRupees = totalAmountPaise / 100;
    const monthlyEMIAmount = Math.ceil(totalAmountRupees / emiMonths);
    
    purchaseRecord.totalEMIMonths = emiMonths;
    purchaseRecord.monthsLeft = emiMonths - 1; // First payment done, remaining months
    purchaseRecord.emiAmount = monthlyEMIAmount;
    
    // Calculate next due date (1 month from now)
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    purchaseRecord.nextEMIDueDate = nextDueDate;
  }

  // Update the user
  await User.updateOne(
    { sessionToken },
    {
      $addToSet: { course: courseId },
      $push: {
        purchaseHistory: purchaseRecord,
      },
      $set: { subscription: maxDays },
    }
  );

  console.log('✅ User enrolled successfully:', {
    userId: user._id,
    courseId,
    isEMI,
    emiMonths,
    amountPaid: amountInRupees,
    monthsLeft: purchaseRecord.monthsLeft,
  });
}

// ── 4) GET handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId      = searchParams.get("id");
  const courseId     = searchParams.get("courseId");
  const sessionToken = searchParams.get("sessionToken");
  
  if (!orderId || !courseId) {
    return NextResponse.json(
      {
        success: false,
        code:    "MISSING_PARAMS",
        message: "id & courseId required",
      },
      { status: 400 }
    );
  }
  
  // 4.1) OAuth
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err: any) {
    console.error("OAuth failed:", err);
    return NextResponse.redirect("/payment/failure", 303);
  }
  
  // 4.2) Order‑Status call
  let statusRes;
  try {
    statusRes = await axios.get(STATUS_URL(orderId), {
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
        Authorization:  `O-Bearer ${accessToken}`,
      },
      timeout: 5000,
    });
    console.log("Order Status response:", statusRes.data);
  } catch (err: any) {
    console.error("Order-Status API error:", err.response?.data || err.message);
    return NextResponse.redirect(`/failure/${orderId}?courseId=${courseId}`, 303);
  }
  
  // 4.3) Inspect state, amount & metaInfo
  const payload = statusRes.data.data || statusRes.data;
  const { state, amount, metaInfo } = payload;

  if (state === "COMPLETED") {
    // 4.4) Enroll with EMI support & redirect to admission
    if (sessionToken) {
      await enrollUser(sessionToken, courseId, amount, orderId, metaInfo);
    }
    
    // build admission URL
    const course = await Course.findById(courseId).lean();
    const name = Array.isArray(course) || !course?.title ? "" : encodeURIComponent(course.title);
    
    // Add EMI info to admission URL if applicable
    const isEMI = metaInfo?.udf4 === 'true';
    const emiMonths = isEMI ? metaInfo?.udf5 : '';
    
    let admissionUrl = `/admission?courseId=${courseId}&courseName=${name}&transactionId=${orderId}`;
    
    if (isEMI) {
      admissionUrl += `&isEMI=true&emiMonths=${emiMonths}`;
    }
    
    const finalAdmissionUrl = new URL(admissionUrl, req.url);
    return NextResponse.redirect(finalAdmissionUrl, 303);
  }
  
  // 4.5) Pending/Failed → failure
  return NextResponse.redirect(`/failure/${orderId}?courseId=${courseId}`, 303);
}