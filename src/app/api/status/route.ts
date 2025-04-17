// app/api/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import sha256 from "crypto-js/sha256";
import axios from "axios";

interface StatusRequest {
  id: string;
}

interface StatusResponse {
  status: string;
  transactionId?: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse<StatusResponse>> {
  try {
    const { id } = (await req.json()) as StatusRequest;
    if (!id) {
      return NextResponse.json(
        { status: "FAIL", transactionId: null },
        { status: 400 }
      );
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID!;
    const saltKey    = process.env.PHONEPE_SALT_KEY!;
    const saltIndex  = process.env.PHONEPE_SALT_INDEX!; // e.g. "1"
    const useSandbox = process.env.NODE_ENV !== "production";

    // Build path and checksum
    const path = `/pg/v1/status/${merchantId}/${id}`;
    const toSign = path + saltKey;
    const hash = sha256(toSign).toString();
    const checksum = `${hash}###${saltIndex}`;

    // Choose correct host
    const baseUrl = useSandbox
      ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
      : "https://api.phonepe.com/apis/hermes";

    // Call PhonePe status API
    const resp = await axios.get(`${baseUrl}${path}`, {
      headers: {
        accept:        "application/json",
        "Content-Type": "application/json",
        "X-VERIFY":     checksum,
        "X-MERCHANT-ID": merchantId,
      },
    });

    // If payment success, return the transactionId
    if (resp.data.success && resp.data.code === "PAYMENT_SUCCESS") {
      return NextResponse.json(
        {
          status: resp.data.code,
          transactionId: resp.data.data.transactionId,
        },
        { status: 200 }
      );
    }

    // Otherwise, treat as failure
    return NextResponse.json(
      { status: "FAIL", transactionId: null },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in payment status check:", err.response?.data || err.message);
    return NextResponse.json(
      { status: "SERVER ERROR", transactionId: null },
      { status: 500 }
    );
  }
}
