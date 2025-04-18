'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: { courseId?: string };
}

export default function PaymentSuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const transactionId = params.get('transactionId');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (!transactionId) {
      setMessage('Invalid payment reference.');
      return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(
          `/api/status?id=${encodeURIComponent(transactionId || "")}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as StatusResponse;

        if (json.success && json.data?.courseId) {
          router.replace(`/courses/${json.data.courseId}`);
        } else {
          setMessage(`Payment ${json.code}: ${json.message}`);
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setMessage(
          'There was an error verifying your payment. Please contact support.'
        );
      }
    }

    verifyPayment();
  }, [transactionId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-green-800 mb-4">
          Payment Status
        </h1>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
