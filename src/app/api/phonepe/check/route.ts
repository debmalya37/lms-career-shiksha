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
  PHONEPE_ENV: ENV,
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

// Base URLs

const BASE = "https://api.phonepe.com/apis/pg";
// = ENV === "PRODUCTION"
  // ? 
  // : "https://api-preprod.phonepe.com/apis/pg-sandbox";

const OAUTH_URL  = `${BASE}/v1/oauth/token`;
const STATUS_URL = (orderId: string) =>
  `${BASE}/checkout/v2/order/${orderId}/status?details=false&errorContext=false`;

/** Fetch OAuth token */
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

/** Enroll user in the course */
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

  // 1) Get access token
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err: any) {
    console.error("OAuth failed:", err);
    return NextResponse.redirect("/payment/failure", 303);
  }

  // 2) Call Order‑Status API
  let statusRes;
  try {
    statusRes = await axios.get(STATUS_URL(orderId), {
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
        Authorization:  `O-Bearer ${accessToken}`,
      },
    });
    console.log("Order Status response:", statusRes.data);
  } catch (err: any) {
    console.error("Order-Status API error:", err.response?.data || err.message);
    return NextResponse.redirect(`/failure/${orderId}?courseId=${courseId}`, 303);
  }

  // 3) Inspect state
  const { state, amount } = statusRes.data as {
    state: string;
    amount: number;
  };

  if (state === "COMPLETED") {
    // 4) Enroll & redirect to admission
    if (sessionToken) {
      await enrollUser(sessionToken, courseId, amount, orderId);
    }
    const course = await Course.findById(courseId).lean();
    const courseName = Array.isArray(course) || !course?.title
      ? ""
      : encodeURIComponent(course.title);
      const admissionUrl = new URL(
        `/admission?courseId=${courseId}&courseName=${courseName}`,
        req.url
      );
      return NextResponse.redirect(admissionUrl, 303);
    }

  // 5) Pending or failed → redirect to failure
  return NextResponse.redirect(
    `/failure/${orderId}?courseId=${courseId}`,
    303
  );
}
