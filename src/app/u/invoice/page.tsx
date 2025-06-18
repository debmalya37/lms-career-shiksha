// app/u/invoice/page.tsx
'use client';

import { useEffect, useState } from 'react';
// import { pdf } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/components/InvoiceDocument';
// import { Font } from '@react-pdf/renderer';

// // ✅ Correct way to register a TTF font
// Font.register({
//   family: 'Roboto',
//   src: '/fonts/Roboto-Regular.ttf'  // must be a local file served correctly
// });



interface Invoice {
  _id: string;
  invoiceId: string;
  createdAt: string;
  studentName: string;
  fatherName: string;
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
  state: string;
  paymentMethod: string;
  transactionId: string;
  course: {
    title: string;
    originalPrice: number;
    discountedPrice: number;
    discount: number;
  };
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
}

export default function UserInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/invoices/me')
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (inv: Invoice) => {
    try {
      setBusyId(inv._id);

      const { pdf, Font } = await import('@react-pdf/renderer');
      Font.register({
        family: 'Poppins',
        fonts: [
          { src: '/fonts/Poppins-Regular.ttf' },
          { src: '/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
        ],
      });
      // 1) Create a PDF instance from our React PDF document
      const blob = await pdf(<InvoiceDocument invoice={inv} />).toBlob();
      // 2) Turn it into a downloadable URL
      const url = URL.createObjectURL(blob);
      // 3) Trigger the browser download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${inv.invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF generation error', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading invoices…</p>;
  if (!invoices.length)
    return <p className="text-center mt-10">No invoices found.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Your Invoices
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                'Invoice ID',
                'Course',
                'Price',
                'Discount',
                'Total',
                'Date',
                'Download',
              ].map((h) => (
                <th key={h} className="px-3 py-2 border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border">{inv.invoiceId}</td>
                <td className="px-3 py-2 border">{inv.course.title}</td>
                <td className="px-3 py-2 border">
                  ₹{inv.course.originalPrice.toFixed(2)}
                </td>
                <td className="px-3 py-2 border">
                  ₹{inv.course.discount.toFixed(2)}
                </td>
                <td className="px-3 py-2 border font-semibold">
                  ₹{inv.totalAmount.toFixed(2)}
                </td>
                <td className="px-3 py-2 border">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 border text-center">
                  <button
                    onClick={() => handleDownload(inv)}
                    disabled={busyId === inv._id}
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      busyId === inv._id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {busyId === inv._id ? 'Generating…' : 'Download'}
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
