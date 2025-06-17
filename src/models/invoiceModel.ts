// models/invoiceModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  admissionFormId?: Types.ObjectId;
  studentName: string;
  fatherName: string;
  studentAddress: string;
  course: {
    id: Types.ObjectId;
    title: string;
    originalPrice: number;
    discount: number;
    discountedPrice: number;
  };
  state: string;
  // Add this to the interface
email?: string;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId:        { type: String, required: true, unique: true },
    admissionFormId:  { type: Schema.Types.ObjectId, ref: 'Admission' },  // <- optional now
    studentName:      { type: String, required: true },
    fatherName:       { type: String, required: true },
    studentAddress:   { type: String, required: true },
    course: {
      id:               { type: Schema.Types.ObjectId, ref: 'Course', required: true },
      title:            { type: String, required: true },
      originalPrice:    { type: Number, required: true },
      discount:         { type: Number, required: true },
      discountedPrice:  { type: Number, required: true },
    },
    state:            { type: String, required: true },
    email: { type: String, required: false }, // New field
    cgst:             { type: Number, required: true },
    sgst:             { type: Number, required: true },
    igst:             { type: Number, required: true },
    taxAmount:        { type: Number, required: true },
    totalAmount:      { type: Number, required: true },
    transactionId:    { type: String, required: true },
    paymentMethod:    { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema);
