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
// OAuth: identity‑manager in Prod, pg‑sandbox in UAT
const OAUTH_BASE = PHONEPE_ENV === "PRODUCTION"
  ? "https://api.phonepe.com/apis/identity-manager"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// Order‑Status: pg in Prod, pg‑sandbox in UAT
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

// ── 3) Enrollment helper ───────────────────────────────────────────────────────
async function enrollUser(
  sessionToken: string,
  courseId: string,
  amountPaid: number,
  orderId: string
) {
  await dbConnect();
  await User.updateOne(
    { sessionToken },
    { $addToSet: { course: courseId } }
  );
  await User.updateOne(
    { sessionToken },
    {
      $push: {
        purchaseHistory: {
          course:        courseId,
          amount:        amountPaid,
          transactionId: orderId,
          purchasedAt:   new Date(),
        },
      },
    }
  );
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

  // 4.3) Inspect state & amount
  const { state, amount } = statusRes.data as {
    state: string;
    amount: number;
  };

  if (state === "COMPLETED") {
    // 4.4) Enroll & redirect to admission
    if (sessionToken) {
      await enrollUser(sessionToken, courseId, amount, orderId);
    }
    const course = await Course.findById(courseId).lean();
    const courseName = Array.isArray(course) || !course?.title
    ? ""
    : encodeURIComponent(course.title);
    const admissionUrl = new URL(
      `/admission?courseId=${courseId}&courseName=${courseName}&transactionId=${orderId}`,
      req.url
    );
    
    return NextResponse.redirect(admissionUrl, 303);
  }

  // 4.5) Pending/Failed → failure page
  return NextResponse.redirect(
    `/failure/${orderId}?courseId=${courseId}`,
    303
  );
}
