import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import Invoice from "@/models/invoiceModel"; // Adjust the import path as needed

interface Invoice {
  _id: string;
  invoiceId: string;
  admissionFormId: string;
  studentName: string;
  fatherName: string;
  studentAddress: string;
  course: {
    id: string;
    title: string;
    originalPrice: number;
    discount: number;
    discountedPrice: number;
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

export async function GET(req: NextRequest, { params }: { params: { invoiceId: string } }) {
  const invoiceId = params.invoiceId;
  const invoice = await Invoice.findOne({ invoiceId }).lean() as Invoice;

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  // Recalculate tax assuming discountedPrice includes tax
  const discountedPrice = invoice.course.discountedPrice;
  const taxRate = 0.18; // 18%
  const taxAmount = +(discountedPrice * taxRate / (1 + taxRate)).toFixed(2);
  const subtotal = +(discountedPrice - taxAmount).toFixed(2);
  let cgst = 0, sgst = 0, igst = 0;

  if (invoice.state.trim().toUpperCase() === 'UP') {
    cgst = +(taxAmount / 2).toFixed(2);
    sgst = +(taxAmount / 2).toFixed(2);
  } else {
    igst = taxAmount;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice - ${invoice.invoiceId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 30px;
      border-radius: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      color: #007BFF;
    }
    .header .invoice-meta {
      text-align: right;
    }
    .section-title {
      font-weight: 600;
      margin: 20px 0 10px;
      font-size: 18px;
      color: #000;
    }
    .details-grid {
      display: flex;
      justify-content: space-between;
      gap: 40px;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .details-box {
      flex: 1;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px;
      border: 1px solid #ccc;
      font-size: 14px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    .totals-table td {
      padding: 4px 8px;
      border: 1px solid #ccc;
      text-align: right;
    }
    .totals-table tr.total-row td {
      background-color: #000;
      color: #fff;
      font-weight: bold;
      font-size: 13px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <h1>INVOICE</h1>
        <p>Invoice ID: ${invoice.invoiceId}</p>
        <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="invoice-meta">
        <strong>Career Shiksha</strong><br/>
        A-79, Ganga Vatika, Ganga Nagar,<br/>
        Meerut,<br/>
        Uttar Pradesh - 250001, India<br/>
        <strong>Email:</strong> affordablecareersolutions@gmail.com<br/>
        <strong>GSTIN:</strong> 09AAWCA8771F1ZY
      </div>
    </div>

    <div class="details-grid">
      <div class="details-box">
        <div class="section-title">Student Info</div>
        Student's Name: ${invoice.studentName}<br/>
        Father's Name: ${invoice.fatherName}<br/>
        Address: ${invoice.studentAddress}<br/>
        State: ${invoice.state}
      </div>
      <div class="details-box">
        <div class="section-title">Payment Info</div>
        Method: ${invoice.paymentMethod}<br/>
        Transaction ID: ${invoice.transactionId}
      </div>
    </div>

    <div class="section-title">Course Details</div>
    <table>
      <thead>
        <tr>
          <th>Course Name</th>
          <th>Original Price</th>
          <th>Discount</th>
          <th>Discounted Price (Incl. Tax)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${invoice.course.title}</td>
          <td>₹${invoice.course.originalPrice.toFixed(2)}</td>
          <td>${invoice.course.discount}</td>
          <td>₹${discountedPrice.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Tax Breakdown</div>
    <table class="totals-table">
      <tbody>
        <tr><td>Subtotal (Excl. Tax)</td><td>₹${subtotal.toFixed(2)}</td></tr>
        <tr><td>CGST (9%)</td><td>₹${cgst.toFixed(2)}</td></tr>
        <tr><td>SGST (9%)</td><td>₹${sgst.toFixed(2)}</td></tr>
        <tr><td>IGST (18%)</td><td>₹${igst.toFixed(2)}</td></tr>
        <tr><td>Total Tax</td><td>₹${taxAmount.toFixed(2)}</td></tr>
        <tr><td>Shipping/Handling</td><td>₹0.00</td></tr>
        <tr class="total-row"><td>Total (Incl. Tax)</td><td>₹${discountedPrice.toFixed(2)}</td></tr>
      </tbody>
    </table>

    <div class="footer">
      This is a system-generated invoice. For queries, contact our support team.
    </div>
  </div>
</body>
</html>
`;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  return new NextResponse(new Blob([Buffer.from(pdfBuffer)]), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceId}.pdf"`,
    },
  });
}
