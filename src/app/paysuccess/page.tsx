// File: app/status/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';

export default function StatusPage() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get('id');
  const courseId = searchParams.get('courseId');

  return (
    <Suspense>
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">✅ Payment Successful</h1>
      <div className="bg-white shadow-md rounded-xl p-6 text-center">
        <p className="text-gray-700 mb-2">
          <strong>Transaction ID:</strong> {txnId || 'Not found'}
        </p>
        <p className="text-gray-700">
          <strong>Course ID:</strong> {courseId || 'Not found'}
        </p>
      </div>
    </div>
    </Suspense>
  );
}
