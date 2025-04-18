// app/payment/success/page.tsx
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React, { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <PaymentSuccessClient />
    </Suspense>
  );
}
