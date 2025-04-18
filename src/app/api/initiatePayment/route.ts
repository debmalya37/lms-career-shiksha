// app/api/initiatePayment/route.ts
import axios from "axios";
import crypto from "crypto";
import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";
import Profile from "@/models/profileModel";

const SALT_KEY    = process.env.PHONEPE_SALT_KEY!;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
// **always** use sandbox until you're ready to go live
const PHONEPE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

export async function POST(req: NextRequest) {
  const { amount, courseId } = await req.json() as { amount:number; courseId:string };
  if (!amount || !courseId) {
    return NextResponse.json({ error:"Missing amount or courseId" }, { status:400 });
  }

  await connectMongo();
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const user = sessionToken
    ? await User.findOne({ sessionToken }).lean()
    : null;
  if (!user) {
    return NextResponse.json({ error:"Not authenticated" }, { status:401 });
  }

  const transactionId = `Tr-${uuidv4().slice(-6)}`;
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: transactionId,
    amount: Math.round(amount*100),
    redirectUrl: `https://civilacademyapp.com/status/${transactionId}?courseId=${courseId}`,
    redirectMode: "POST",
    callbackUrl: `https://civilacademyapp.com/api/status?id=${transactionId}&courseId=${courseId}`,
    mobileNumber: user.phoneNo || "",
    paymentInstrument: { type: "PAY_PAGE" }
  };
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const keyIndex = process.env.PHONEPE_SALT_INDEX!;
  const toSign   = base64 + "/pg/v1/pay" + SALT_KEY;
  const hash     = crypto.createHash("sha256").update(toSign).digest("hex");
  const checksum = `${hash}###${keyIndex}`;

  try {
    const resp = await axios.post(
      PHONEPE_URL,
      { request: base64 },
      {
        headers: {
          accept:        "application/json",
          "Content-Type":"application/json",
          "X-VERIFY":    checksum
        },
      }
    );
    const redirectUrl = resp.data.data.instrumentResponse.redirectInfo.url;
    return NextResponse.json({ redirectUrl, transactionId });
  } catch (err:any) {
    console.error("PhonePe initiation error:", err.response?.data || err.message);
    return NextResponse.json(
      { error:"Payment initiation failed", details: err.message },
      { status:500 }
    );
  }
}
