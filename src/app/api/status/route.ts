// File: app/api/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

const PHONEPE_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox";

async function fetchPhonePeStatus(id: string) {
  const mid = process.env.PHONEPE_MERCHANT_ID!;
  const key = process.env.PHONEPE_SALT_KEY!;
  const idx = process.env.PHONEPE_SALT_INDEX!;
  const path = `/pg/v1/status/${mid}/${id}`;
  const checksum =
    crypto.createHash("sha256").update(path + key).digest("hex") + `###${idx}`;
  const resp = await axios.get(PHONEPE_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": mid,
    },
  });
  return resp.data;
}

async function enrollUser(token: string, courseId: string) {
  await dbConnect();
  await User.updateOne({ sessionToken: token }, { $addToSet: { course: courseId } });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");          // merchantTransactionId
  const courseId = url.searchParams.get("courseId");
  const raw = url.searchParams.get("raw");        // if present, return JSON instead of redirect

  if (!id || !courseId) {
    return NextResponse.json(
      { success: false, code: "MISSING", message: "id & courseId required" },
      { status: 400 }
    );
  }

  let phonePe;
  try {
    phonePe = await fetchPhonePeStatus(id);
  } catch (e) {
    console.error("PhonePe fetch error", e);
    // If “raw=true”, return JSON indicating failure
    if (raw === "true") {
      return NextResponse.json(
        { success: false, code: "PHONEPE_API_ERROR", message: "Could not fetch PhonePe status" },
        { status: 502 }
      );
    }
    // Otherwise, redirect to /failure
    const redirectTo = new URL(`/failure/${id}?courseId=${courseId}`, req.url);
    return NextResponse.redirect(redirectTo);
  }

  // If the caller specifically asked for raw JSON, return it:
  if (raw === "true") {
    return NextResponse.json({
      success: phonePe.success,
      code: phonePe.code,
      message: phonePe.message,
      data: { transactionId: id, courseId },
    });
  }

  // Otherwise, do the “redirect” logic as before:
  if (phonePe.success) {
    const sessionToken = req.cookies.get("sessionToken")?.value;
    if (sessionToken) {
      await enrollUser(sessionToken, courseId);
      // Also record purchase history
      await User.updateOne(
        { sessionToken },
        {
          $push: {
            purchaseHistory: {
              course: courseId,
              amount: phonePe.data?.amount ?? 0,
              transactionId: id,
              purchasedAt: new Date(),
            },
          },
        }
      );
    }
    const redirectTo = new URL(`/success/${id}?courseId=${courseId}`, req.url);
    return NextResponse.redirect(redirectTo);
  } else {
    const redirectTo = new URL(`/failure/${id}?courseId=${courseId}`, req.url);
    return NextResponse.redirect(redirectTo);
  }
}

export async function POST(req: NextRequest) {
  // (You can leave the POST logic as‐is, or add “raw=true” handling here if needed.)
  const { searchParams } = new URL(req.url);
  const txnId = searchParams.get("id");
  const courseId = searchParams.get("courseId");

  if (!txnId || !courseId) {
    return NextResponse.json(
      { success: false, code: "MISSING_PARAMS", message: "id & courseId required" },
      { status: 400 }
    );
  }

  let formData: any;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, code: "BAD_FORM", message: "Invalid form‐data" },
      { status: 400 }
    );
  }

  let phonePeResp: any;
  try {
    phonePeResp = await fetchPhonePeStatus(txnId);
  } catch (e: any) {
    console.error("PhonePe fetch error", e.response?.data || e.message);
    return NextResponse.json(
      { success: false, code: e.code || "PHONEPE_ERROR", message: e.message },
      { status: 502 }
    );
  }

  if (phonePeResp.success) {
    const sessionToken = req.cookies.get("sessionToken")?.value;
    if (sessionToken) {
      await enrollUser(sessionToken, courseId);
      await User.updateOne(
        { sessionToken },
        {
          $push: {
            purchaseHistory: {
              course: courseId,
              amount: phonePeResp.data?.amount ?? 0,
              transactionId: txnId,
              purchasedAt: new Date(),
            },
          },
        }
      );
    }
  }

  return NextResponse.json({
    success: phonePeResp.success,
    code: phonePeResp.code,
    message: phonePeResp.message,
    data: { transactionId: txnId, courseId },
  });
}
