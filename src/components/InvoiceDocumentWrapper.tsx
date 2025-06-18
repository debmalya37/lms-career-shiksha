'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import PDFDownloadLink to avoid SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

// Dynamically import your InvoiceDocument component
const InvoiceDocument = dynamic(
  () => import('./InvoiceDocument').then(mod => mod.InvoiceDocument),
  { ssr: false }
);

interface Props {
  invoiceData: any;
}

export default function InvoiceDocumentWrapper({ invoiceData }: Props) {
  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoiceData} />}
      fileName={`invoice-${invoiceData.invoiceId}.pdf`}
    >
      {({ loading }) =>
        loading ? 'Generating PDF...' : 'Download PDF'
      }
    </PDFDownloadLink>
  );
}
