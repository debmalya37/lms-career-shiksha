// app/api/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

interface PhonePeStatusResponse {
  success: boolean;
  code:    string;
  message: string;
  data?: {
    transactionId: string;
    courseId?:     string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<PhonePeStatusResponse>> {
  // 1) Parse JSON body
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({
      success: false,
      code:    'BAD_JSON',
      message: 'Cannot parse request body as JSON',
    }, { status: 400 });
  }

  const id       = body.id as string | undefined;
  const courseId = body.courseId as string | undefined;

  if (!id) {
    return NextResponse.json({
      success: false,
      code:    'MISSING_ID',
      message: 'Missing transaction id in request body',
    }, { status: 400 });
  }

  // 2) Load & validate env vars
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey    = process.env.PHONEPE_SALT_KEY;
  const saltIndex  = process.env.PHONEPE_SALT_INDEX;
  if (!merchantId || !saltKey || !saltIndex) {
    console.error('❌ Missing PhonePe env vars:', { merchantId, saltKey, saltIndex });
    return NextResponse.json({
      success: false,
      code:    'CONFIG_ERROR',
      message: 'PhonePe configuration is incomplete on the server',
    }, { status: 500 });
  }

  // 3) Build path & signature
  const path    = `/pg/v1/status/${merchantId}/${id}`;
  const toSign  = path + saltKey;
  const hash    = crypto.createHash('sha256').update(toSign).digest('hex');
  const checksum = `${hash}###${saltIndex}`;

  // 4) Pick the right base URL
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  // 5) Call PhonePe
  try {
    const resp = await axios.get(`${baseUrl}${path}`, {
      headers: {
        'Content-Type':   'application/json',
        accept:           'application/json',
        'X-VERIFY':       checksum,
        'X-MERCHANT-ID':  merchantId,
      },
      timeout: 10000,
    });

    if (resp.data.success) {
      return NextResponse.json({
        success: true,
        code:    resp.data.code,
        message: resp.data.message,
        data: {
          transactionId: id,
          courseId,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        code:    resp.data.code,
        message: resp.data.message,
      });
    }
  } catch (err: any) {
    console.error('❌ PhonePe status API error:', err.response?.data || err.message);
    return NextResponse.json({
      success: false,
      code:    err.response?.data?.code || 'PHONEPE_ERROR',
      message: err.response?.data?.message || err.message,
    }, { status: 502 });
  }
}
