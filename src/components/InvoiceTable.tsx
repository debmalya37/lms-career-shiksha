'use client';

export const dynamic = "force-dynamic";

import React, { useState } from 'react';

import { InvoiceDocument } from './InvoiceDocument';

interface Invoice {
  _id: string;
  invoiceId: string;
  createdAt: string;
  studentName: string;
  studentAddress?: string;
  fatherName: string;
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
  state: string;
  pincode: number;
  paymentMethod: string;
  transactionId: string;
  course: {
    title: string;
    originalPrice: number;
    discount: number;
    discountedPrice: number;
  };
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
}

interface InvoiceTableProps {
  filteredInvoices: Invoice[];
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ filteredInvoices }) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDownload = async (inv: Invoice) => {
    try {
        const { pdf } = await import('@react-pdf/renderer');
      setBusyId(inv._id);
      const blob = await pdf(
        <InvoiceDocument
          invoice={inv}
        />
      ).toBlob();

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${inv.invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF blob.');
      }
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            {[
              'Invoice ID',
              'Student',
              'Course',
              'Amount',
              'Tax',
              'cgst',
              'sgst',
              'igst',
              'pincode',
              'Total',
              'Payment Method',
              'Date',
              'PDF',
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-sm font-medium text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((inv) => (
            <tr key={inv._id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{inv.invoiceId}</td>
              <td className="px-4 py-2">{inv.studentName}</td>
              <td className="px-4 py-2">{inv.course.title}</td>
              <td className="px-4 py-2">₹{inv.course.discountedPrice.toFixed(2)}</td>
              <td className="px-4 py-2">₹{inv.taxAmount.toFixed(2)}</td>
              <td className="px-4 py-2">₹{inv.cgst.toFixed(2)}</td>
              <td className="px-4 py-2">₹{inv.sgst.toFixed(2)}</td>
              <td className="px-4 py-2">₹{inv.igst.toFixed(2)}</td>
              <td className="px-4 py-2">{inv.pincode}</td>
              <td className="px-4 py-2 font-semibold text-indigo-600">
                ₹{inv.totalAmount.toFixed(2)}
              </td>
              <td className="px-4 py-2">{inv.paymentMethod}</td>
              <td className="px-4 py-2">
                {new Date(inv.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
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
          {filteredInvoices.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
