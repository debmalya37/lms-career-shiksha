// app/purchases/page.tsx
"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

interface PurchaseRecord {
  course: { _id: string; title: string };
  amount: number;
  transactionId: string;
  purchasedAt: string;
}

export default function PurchasesPage() {
  const [records, setRecords] = useState<PurchaseRecord[] | null>(null);

  useEffect(() => {
    axios.get('/api/purchases')
      .then(res => setRecords(res.data.purchaseHistory))
      .catch(console.error);
  }, []);

  if (!records) return <p>Loading…</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Purchase History</h1>
      {records.length === 0 && <p>You have no purchases yet.</p>}
      <ul className="space-y-4">
        {records.map(rec => (
          <li key={rec.transactionId} className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{rec.course.title}</h2>
            <p>Amount: ₹{(rec.amount/100).toFixed(2)}</p>
            <p>Txn ID: {rec.transactionId}</p>
            <p>Date: {new Date(rec.purchasedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
