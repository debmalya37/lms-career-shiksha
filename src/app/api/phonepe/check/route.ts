// File: app/api/phonepe/check/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY    = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX  = process.env.PHONEPE_SALT_INDEX!;

// UAT (sandbox) base URL for PhonePe’s “check status”:
const PHONEPE_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox";

/** 
 * Helper that calls PhonePe’s /pg/v1/status/{merchantId}/{txnId} and returns the JSON.
 */
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

/** 
 * Once payment is confirmed, add the course to the user’s document 
 * and push a purchaseHistory entry.
 */
async function enrollUser(
  sessionToken: string,
  courseId: string,
  amountPaid: number,
  txnId: string
) {
  await dbConnect();
  // 1) Push course ID into user’s “course” array if missing
  await User.updateOne(
    { sessionToken },
    { $addToSet: { course: courseId } }
  );
  // 2) Push into purchaseHistory
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

/**
 * Only POST handler is needed. PhonePe’s redirect (and callback) will POST here:
 *    /api/phonepe/check?id=<txnId>&courseId=<courseId>
 */
export async function POST(req: NextRequest) {
  // 1) Extract merchantTransactionId & courseId from query string
  const { searchParams } = new URL(req.url);
  const txnId    = searchParams.get("id");
  const courseId = searchParams.get("courseId");
  const sessionToken = searchParams.get("sessionToken");


  if (!txnId || !courseId) {
    return NextResponse.json(
      { success: false, code: "MISSING_PARAMS", message: "id & courseId required" },
      { status: 400 }
    );
  }

  // 2) PhonePe’s callback POST will include form-data; parse it to satisfy PhonePe
  try {
    await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, code: "BAD_FORM", message: "Invalid form‐data" },
      { status: 400 }
    );
  }

  // 3) Now do a server-to-server “check status”:
  let phonePeResp: any;
  try {
    phonePeResp = await fetchPhonePeStatus(txnId);
  } catch (err: any) {
    console.error("PhonePe Check-Status error:", err.response?.data || err.message);
    // If we cannot reach PhonePe, treat as failure and redirect there:
    const failureRedirect = new URL(`/failure/${txnId}?courseId=${courseId}`, req.url);
    return NextResponse.redirect(failureRedirect, 303);
  }

  // 4) If PhonePe says “PAYMENT_SUCCESS”:
  if (phonePeResp.success && phonePeResp.code === "PAYMENT_SUCCESS") {
    const amountPaid   = phonePeResp.data?.amount ?? 0;
    const sessionToken = searchParams.get("sessionToken");

    if (sessionToken) {
      console.log("session token:",sessionToken)
      await enrollUser(sessionToken, courseId, amountPaid, txnId);
    }
    // Finally redirect to Home page (or you could do `/success/...`)
    // 👇 Redirect to the dynamic payment status page
  // const successRedirect = new URL(`http://localhost:3000/status/${txnId}?courseId=${courseId}`, req.url);
  
  // const url = req.nextUrl.clone();
  // url.pathname = `/status/${txnId}`;       // no query string here
  // url.search   = `?courseId=${courseId}`; 
  // return NextResponse.redirect(url, { status: 303 });
  // Use a _relative_ URL so Next knows it’s in the same app:
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civilacademyapp.com/";
  const successRedirect = `${baseUrl}/status/${txnId}?courseId=${courseId}`;
  console.log("Redirecting to:", successRedirect);

return NextResponse.redirect("/", {
  status: 303});

  // return NextResponse.redirect(`/success/${txnId}?courseId=${courseId}`, 303);

  }

  // 5) Otherwise (FAILURE, PENDING, etc), redirect to /failure
  const failureRedirect = new URL(`/status/${txnId}?courseId=${courseId}`, req.url);
  return NextResponse.redirect(failureRedirect, 303);
}
