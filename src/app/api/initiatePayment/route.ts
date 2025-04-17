// app/api/initiatePayment/route.ts
import axios from "axios";
import crypto from "crypto";
import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";
import Profile, { IProfile } from "@/models/profileModel";

// ✅ PhonePe merchant credentials
const SALT_KEY    = process.env.PHONEPE_SALT_KEY!;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;

// Base URLs
const SANDBOX_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const PROD_URL    = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

export async function POST(req: NextRequest) {
  // 1) Parse body
  const { amount, courseId } = (await req.json()) as {
    amount: number;
    courseId: string;
  };

  if (!amount || !courseId) {
    return NextResponse.json(
      { error: "Missing amount or courseId" },
      { status: 400 }
    );
  }

  // 2) Connect to DB & fetch user/profile
  await connectMongo();
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userDoc = sessionToken
    ? (await User.findOne({ sessionToken }).lean()) as User
    : null;

  if (!userDoc) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const profileDoc = (await Profile.findOne({ userId: userDoc._id }).lean()) as
    | IProfile
    | null;

  // 3) Build unique transaction ID
  const transactionId = `Tr-${uuidv4().slice(-6)}`;

  // 4) Prepare PhonePe payload
  const payload = {
    merchantId:            MERCHANT_ID,
    merchantTransactionId: transactionId,
    amount:                Math.round(amount * 100),
    redirectUrl:           `http://localhost:3000/status/${transactionId}?courseId=${courseId}`,
    redirectMode:          "POST",
    callbackUrl:           `http://localhost:3000/api/status?id=${transactionId}&courseId=${courseId}`,
    mobileNumber:           userDoc.phoneNo || "",
    paymentInstrument:     { type: "PAY_PAGE" },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

  // 5) Compute X‑VERIFY
  const keyIndex   = process.env.PHONEPE_SALT_INDEX!;
  const stringToSign = base64Payload + "/pg/v1/pay" + SALT_KEY;
  const hash        = crypto.createHash("sha256").update(stringToSign).digest("hex");
  const checksum    = `${hash}###${keyIndex}`;

  // 6) Call PhonePe
  try {
    const phonepeURL = process.env.NODE_ENV === "production" ? PROD_URL : SANDBOX_URL;
    const response   = await axios.post(
      phonepeURL,
      { request: base64Payload },
      {
        headers: {
          accept:       "application/json",
          "Content-Type": "application/json",
          "X-VERIFY":     checksum,
        },
      }
    );

    const redirectUrl =
      response.data.data.instrumentResponse.redirectInfo.url;

    return NextResponse.json({ redirectUrl, transactionId });
  } catch (err: any) {
    console.error("Payment initiation error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Payment initiation failed", details: err.message },
      { status: 500 }
    );
  }
}
