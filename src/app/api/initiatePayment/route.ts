import axios from "axios";
import crypto from "crypto";
import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";

const {
  PHONEPE_CLIENT_ID: CLIENT_ID,
  PHONEPE_CLIENT_SECRET: CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION: CLIENT_VERSION,
  PHONEPE_SALT_KEY: SALT_KEY,
  PHONEPE_MERCHANT_ID: MERCHANT_ID,
  PHONEPE_SALT_INDEX: SALT_INDEX,
} = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_VERSION || !SALT_KEY || !MERCHANT_ID || !SALT_INDEX) {
  throw new Error("Missing required PhonePe credentials in environment variables");
}

// Production endpoints
const OAUTH_URL   = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";
const PAYMENT_URL = "https://api.phonepe.com/apis/pg/checkout/v2/pay";

export async function POST(req: NextRequest) {
  const { amount, courseId } = (await req.json()) as {
    amount: number;
    courseId: string;
  };

  if (!amount || !courseId) {
    return NextResponse.json({ error: "Missing amount or courseId" }, { status: 400 });
  }

  // 1) Ensure user is authenticated
  await connectMongo();
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const user = sessionToken ? await User.findOne({ sessionToken }).lean() : null;
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) Generate a unique transaction ID
  const transactionId = `Tr-${uuidv4().slice(-6)}`;

  // 3) Build the payment payload
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: transactionId,
    amount: Math.round(amount * 100), // in paise
    redirectUrl: `https://civilacademyapp.com/api/phonepe/check?id=${transactionId}&courseId=${courseId}&sessionToken=${sessionToken}`,
    redirectMode: "POST",
    callbackUrl: `https://civilacademyapp.com/api/phonepe/check?id=${transactionId}&courseId=${courseId}&sessionToken=${sessionToken}`,
    mobileNumber: user.phoneNo || "",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  // 4) Encode and sign the payload
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const toSign = base64 + "/pg/checkout/v2/pay" + SALT_KEY;
  const hash = crypto.createHash("sha256").update(toSign).digest("hex");
  const checksum = `${hash}###${SALT_INDEX}`;

  try {
    // 5) Get OAuth access token
    const tokenRes = await axios.post(
      OAUTH_URL,
      new URLSearchParams(
        Object.entries({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          client_version: CLIENT_VERSION, // This should be set in your env
        }).reduce((acc, [key, value]) => {
          if (value !== undefined) acc[key] = value;
          return acc;
        }, {} as Record<string, string>)
      ),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;
    console.log("PhonePe access token received:", accessToken);
    if (!accessToken) {
      throw new Error("PhonePe access token not received.");
    }

    // 6) Call Create Payment API
    const payRes = await axios.post(
      PAYMENT_URL,
      { request: base64 },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": MERCHANT_ID,
        },
      }
    );

    const redirectUrl = payRes.data.data?.instrumentResponse?.redirectInfo?.url;
    if (!redirectUrl) {
      throw new Error("PhonePe payment URL not returned.");
    }

    return NextResponse.json({ redirectUrl, transactionId });

  } catch (err: any) {
    console.error("PhonePe initiation error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Payment initiation failed", details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
