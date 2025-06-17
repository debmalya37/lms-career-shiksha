'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Invoice {
  _id: string;
  invoiceId: string;
  studentName: string;
  fatherName: string;
  studentAddress: string;
  email: string;
  course: {
    title: string;
    originalPrice: number;
    discountedPrice: number;
    discount: number;
  };
  state: string;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
  createdAt: string;
}

export default function UserInvoicePage() {
  const { status } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInvoices = async () => {
      try {
        const res = await fetch('/api/invoices/me');
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();
        setInvoices(data.invoices);
      } catch (err) {
        console.error('Failed to fetch user invoices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInvoices();
  }, [status, router]);

  const handleDownload = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/download`);
      if (!res.ok) throw new Error('Failed to download invoice');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading invoices...</p>;
  if (invoices.length === 0) return <p className="text-center mt-10">No invoices found for your account.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Your Invoices</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 border">Invoice ID</th>
              <th className="px-3 py-2 border">Course</th>
              <th className="px-3 py-2 border">Price</th>
              <th className="px-3 py-2 border">Discount</th>
              <th className="px-3 py-2 border">Total</th>
              <th className="px-3 py-2 border">Date</th>
              <th className="px-3 py-2 border">Download</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border">{inv.invoiceId}</td>
                <td className="px-3 py-2 border">{inv.course.title}</td>
                <td className="px-3 py-2 border">₹{inv.course.originalPrice}</td>
                <td className="px-3 py-2 border">₹{inv.course.discount}</td>
                <td className="px-3 py-2 border font-semibold">₹{inv.totalAmount}</td>
                <td className="px-3 py-2 border">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 border text-center">
                  <button
                    onClick={() => handleDownload(inv.invoiceId)}
                    className="text-indigo-600 hover:underline"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
