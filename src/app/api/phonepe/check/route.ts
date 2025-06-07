// File: app/api/phonepe/check/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import Course from "@/models/courseModel";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY    = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX!;
const PHONEPE_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox";

async function fetchPhonePeStatus(merchantTxnId: string) {
  const path = `/pg/v1/status/${MERCHANT_ID}/${merchantTxnId}`;
  const hash      = crypto.createHash("sha256").update(path + SALT_KEY).digest("hex");
  const checksum  = `${hash}###${SALT_INDEX}`;

  const resp = await axios.get(`${PHONEPE_BASE}${path}`, {
    headers: {
      "Content-Type":   "application/json",
      "X-VERIFY":       checksum,
      "X-MERCHANT-ID":  MERCHANT_ID,
    },
  });
  return resp.data;
}

async function enrollUser(
  sessionToken: string,
  courseId: string,
  amountPaid: number,
  txnId: string
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
          course:         courseId,
          amount:         amountPaid,
          transactionId:  txnId,
          purchasedAt:    new Date(),
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txnId        = searchParams.get("id");
  const courseId     = searchParams.get("courseId");
  const sessionToken = searchParams.get("sessionToken");

  if (!txnId || !courseId) {
    return NextResponse.json(
      { success: false, code: "MISSING_PARAMS", message: "id & courseId required" },
      { status: 400 }
    );
  }

  // parse PhonePe's POST form-data
  try {
    await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, code: "BAD_FORM", message: "Invalid form‐data" },
      { status: 400 }
    );
  }

  // check status
  let phonePeResp: any;
  try {
    phonePeResp = await fetchPhonePeStatus(txnId);
  } catch (err: any) {
    console.error("PhonePe Check-Status error:", err.response?.data || err.message);
    const failureRedirect = new URL(`/failure/${txnId}?courseId=${courseId}`, req.url);
    return NextResponse.redirect(failureRedirect, 303);
  }

  // on success
  if (phonePeResp.success && phonePeResp.code === "PAYMENT_SUCCESS") {
    const amountPaid = phonePeResp.data?.amount ?? 0;
    const sessionToken = searchParams.get("sessionToken");
    if (sessionToken) {
      console.log("session token:",sessionToken)
      await enrollUser(sessionToken, courseId, amountPaid, txnId);
    }

    // fetch course title for admission redirect
    const course = await Course.findById(courseId).lean();
    const courseName = Array.isArray(course) || !course?.title
      ? ""
      : encodeURIComponent(course.title);

    // redirect into admission form
    const admissionUrl = new URL(
      `/admission?courseId=${courseId}&courseName=${courseName}`,
      req.url
    );
    return NextResponse.redirect(admissionUrl, 303);
  }

  // on failure or pending
  const failureRedirect = new URL(`/failure/${txnId}?courseId=${courseId}`, req.url);
  return NextResponse.redirect(failureRedirect, 303);
}
