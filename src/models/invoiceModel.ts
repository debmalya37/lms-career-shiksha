// models/invoiceModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  admissionFormId?: Types.ObjectId;
  studentName: string;
  fatherName: string;
  address1: string;
  address2?: string;
  phone?: string;
  course: {
    id: Types.ObjectId;
    title: string;
    originalPrice: number;
    discount: number;
    discountedPrice: number;
  };
  state: string;
  email?: string;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
  pincode?: number; // optional field for pincode
  createdAt: Date;
  updatedAt: Date;

}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId:       { type: String, required: true, unique: true },
    admissionFormId: { type: Schema.Types.ObjectId, ref: 'Admission' },  // optional
    studentName:     { type: String, required: true },
    fatherName:      { type: String, required: true },
    address1:        { type: String, required: true },
    address2:        { type: String },                                 // new
    phone:           { type: String },                                 // new
    course: {
      id:              { type: Schema.Types.ObjectId, ref: 'Course', required: true },
      title:           { type: String, required: true },
      originalPrice:   { type: Number, required: true },
      discount:        { type: Number, required: true },
      discountedPrice: { type: Number, required: true },
    },
    state:           { type: String, required: true },
    email:           { type: String },                                 // optional
    cgst:            { type: Number, required: true },
    sgst:            { type: Number, required: true },
    igst:            { type: Number, required: true },
    taxAmount:       { type: Number, required: true },
    totalAmount:     { type: Number, required: true },
    transactionId:   { type: String, required: true },
    paymentMethod:   { type: String, required: true },
    pincode:       { type: Number, required:true },                                   // optional
  },
  { timestamps: true }
);

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema);
