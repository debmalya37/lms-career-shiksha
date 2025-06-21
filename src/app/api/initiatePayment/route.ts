// app/api/initiatePayment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';

const {
  PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_VERSION,
} = process.env;

if (
  !PHONEPE_CLIENT_ID ||
  !PHONEPE_CLIENT_SECRET ||
  !PHONEPE_CLIENT_VERSION
) {
  console.error('❌ Missing PhonePe env vars:', {
    PHONEPE_CLIENT_ID,
    PHONEPE_CLIENT_SECRET,
    PHONEPE_CLIENT_VERSION,
  });
  throw new Error(
    'Missing one of PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_VERSION'
  );
}



const BASE =
  process.env.PHONEPE_ENV === 'PRODUCTION'
    ? 'https://api.phonepe.com/apis/identity-manager'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const OAUTH_URL = `${BASE}/v1/oauth/token`;
const PAY_URL   = process.env.PHONEPE_ENV === 'PRODUCTION'
  ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';


export async function POST(req: NextRequest) {
  // 0) parse
  let payload: { amount?: number; courseId?: string; promoCode?: string };
  try {
    payload = await req.json();
    console.log('📥 Received payload:', payload);
  } catch (e) {
    console.error('❌ Invalid JSON:', e);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { amount, courseId, promoCode } = payload!;
  if (!amount || !courseId) {
    console.warn('⚠️ Missing amount/courseId:', { amount, courseId });
    return NextResponse.json(
      { error: 'Missing amount or courseId' },
      { status: 400 }
    );
  }

  // 1) Auth & user
  await connectMongo();
  const sessionToken = req.cookies.get('sessionToken')?.value;
  console.log('🔑 Session token:', sessionToken);
  const user = sessionToken
    ? await User.findOne({ sessionToken }).lean()
    : null;
  console.log('👤 User:', user?._id);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 2) build IDs & URLs
  const merchantOrderId = `ORD-${uuidv4().slice(-8)}`;
  const redirectUrl = `https://civilacademyapp.com/api/phonepe/check?id=${merchantOrderId}&courseId=${courseId}&sessionToken=${sessionToken}`;
  console.log('🆔 merchantOrderId:', merchantOrderId);
  console.log('🌐 redirectUrl:', redirectUrl);

  // 3) OAuth token
  let accessToken: string;
  try {
    const authRes = await axios.post(
      OAUTH_URL,
      new URLSearchParams({
        grant_type:     'client_credentials',
        client_id:      PHONEPE_CLIENT_ID,
        client_secret:  PHONEPE_CLIENT_SECRET,
        client_version: PHONEPE_CLIENT_VERSION,
      } as Record<string, string>),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('📣 OAuth response:', authRes.data);
    accessToken = authRes.data.access_token;
    if (!accessToken) throw new Error('No access_token');
  } catch (e: any) {
    console.error('❌ OAuth error:', e.response?.data || e.message);
    return NextResponse.json(
      { error: 'Auth failed', details: e.response?.data || e.message },
      { status: 502 }
    );
  }

  // 4) build v2 body
  const body = {
    merchantOrderId,
    amount:      Math.round(amount * 100),
    expireAfter: 1200,
    metaInfo: {
      udf1: `course-${courseId}`,
      udf2: `user-${user._id}`,
      udf3: promoCode || '', 
    },
    paymentFlow: {
      type:         'PG_CHECKOUT',
      message:      'Please complete your payment on PhonePe',
      merchantUrls: { redirectUrl },
    },
  };
  console.log('📤 Pay body:', body);

  // 5) call Pay endpoint
  try {
    const resp = await axios.post(PAY_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept:         'application/json',
        Authorization:  `O-Bearer ${accessToken}`,
      },
    });
    console.log('✅ Pay raw response:', resp.data);

    // handle both possible shapes:
    const top = resp.data;
    const nested = top.data;
    const orderId =
      (nested && nested.orderId) ||
      top.orderId ||
      top.data?.orderId;
    const redirect =
      (nested &&
        nested.instrumentResponse?.redirectInfo?.url) ||
      top.redirectUrl ||
      top.data?.redirectUrl;

    console.log('🔀 Parsed orderId:', orderId);
    console.log('🔀 Parsed redirectUrl:', redirect);

    if (!orderId || !redirect) {
      console.error('❌ Unexpected response shape:', resp.data);
      throw new Error('Malformed pay response');
    }

    return NextResponse.json({ orderId, redirectUrl: redirect });
  } catch (e: any) {
    console.error('❌ Pay API error:', e.response?.data || e.message);
    return NextResponse.json(
      { error: 'Payment initiation failed', details: e.response?.data || e.message },
      { status: 502 }
    );
  }
}
