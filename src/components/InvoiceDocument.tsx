// components/InvoiceDocument.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';


// Font.register({
//     family: 'Helvetica',
//     fonts: [
//         { src: 'Helvetica' } // use built-in font
//     ]
// });
  
  

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 30,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 24, color: '#007BFF' },
  invoiceMeta: { fontSize: 10, textAlign: 'right' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, marginBottom: 6, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  table: { display: 'flex', width: 'auto', marginVertical: 10 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { width: '25%', borderBottom: 1, padding: 4, fontWeight: 'bold' },
  tableCol: { width: '25%', padding: 4, borderBottom: 1 },
  totals: { marginTop: 10, alignSelf: 'flex-end', width: '40%' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 4 },
  totalLabel: { fontWeight: 'bold' },
  footer: { marginTop: 20, fontSize: 10, textAlign: 'center', color: '#888' },
});

interface Invoice {
  invoiceId: string;
  createdAt: string;
  studentName: string;
  studentAddress?: string;
  fatherName: string;
  address1: string;
  address2?: string;
  pincode:number;
  phone?: string;
  email?: string;
  state: string;
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

export const InvoiceDocument: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <View style={styles.invoiceMeta}>
          <Text>Invoice ID: {invoice.invoiceId}</Text>
          <Text>Date: {new Date(invoice.createdAt).toLocaleDateString()}</Text>
          <Text>Affordable Career Solutions Pvt Ltd</Text>
          <Text>A‑79, Ganga Vatika, Meerut, UP 250001</Text>
          <Text>Email: affordablecareersolutions@gmail.com</Text>
          <Text>GSTIN: 09AAWCA8771F1ZY</Text>
          <Text>SAC No: 999293</Text>
        </View>
      </View>

      {/* Student & Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Info</Text>
        <Text>Name: {invoice.studentName}</Text>
        <Text>Father: {invoice.fatherName}</Text>
        <Text>Address:</Text>
        <Text>  {invoice.address1}</Text>
  { <Text>  {invoice.address2}</Text>}
  { <Text>  {invoice.pincode}</Text>}
  <Text>State: {invoice.state}</Text>
  {invoice.phone && <Text>Phone: {invoice.phone}</Text>}
  {invoice.email && <Text>Email: {invoice.email}</Text>}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Info</Text>
        <Text>Method: {invoice.paymentMethod}</Text>
        <Text>Txn ID: {invoice.transactionId}</Text>
      </View>

      {/* Course Table */}
      <Text style={styles.sectionTitle}>Course Details</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {['Course', 'Original', 'Discount', 'Final (Incl. Tax)'].map((h, i) => (
            <Text key={i} style={styles.tableColHeader}>{h}</Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCol}>{invoice.course.title}</Text>
          <Text style={styles.tableCol}>₹{invoice.course.originalPrice.toFixed(2)}</Text>
          <Text style={styles.tableCol}>₹{invoice.course.discount.toFixed(2)}</Text>
          <Text style={styles.tableCol}>₹{invoice.course.discountedPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totals}>
+       {/* Net Taxable Amount */}
+       <View style={styles.totalsRow}>
+         <Text>Net Taxable Amount:</Text>
+         <Text>₹{(invoice.totalAmount - invoice.taxAmount).toFixed(2)}</Text>
+       </View>
        <View style={styles.totalsRow}>
          <Text>CGST(9%):</Text><Text>₹{invoice.cgst.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text>SGST(9%):</Text><Text>₹{invoice.sgst.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text>IGST(18%):</Text><Text>₹{invoice.igst.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text>Total Tax:</Text><Text>₹{invoice.taxAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>Grand Total:</Text>
          <Text style={styles.totalLabel}>₹{invoice.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        This is a system‑generated invoice. Contact support for queries.
        <br /> <hr />All data as per user input.
      </Text>
    </Page>
  </Document>
);
