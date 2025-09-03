import mongoose, { Schema, Document } from "mongoose";

export interface IOfflineEMI extends Document {
  studentName: string;
  studentAddress: string;
  centerAddress: string;
  totalEmis: number;
  courseName: string;
  emisPaidMonths: number;
  emisLeft: number;
  monthlyEmiAmount: number;
  monthlyEmiDate: number; // day of the month (1–31)
  totalEmiPaid: number;
  totalEmiDue: number;
  status: "pending" | "completed";
  createdAt: Date;

  // Virtuals
  nextEmiDate?: string;
  emiSchedule?: { date: string; paid: boolean }[];
}

const OfflineEMISchema = new Schema<IOfflineEMI>(
  {
    studentName: { type: String, required: true },
    studentAddress: { type: String, required: true },
    centerAddress: { type: String, required: true },
    totalEmis: { type: Number, required: true },
    courseName: { type: String, required: true },
    emisPaidMonths: { type: Number, default: 0 },
    emisLeft: { type: Number, default: function () { return this.totalEmis; } },
    monthlyEmiAmount: { type: Number, required: true },
    monthlyEmiDate: { type: Number, required: true },
    totalEmiPaid: { type: Number, default: 0 },
    totalEmiDue: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },   // ✅ ensure virtuals appear in API response
    toObject: { virtuals: true },
  }
);

// ✅ Compute next EMI date
OfflineEMISchema.virtual("nextEmiDate").get(function (this: IOfflineEMI) {
  if (this.status === "completed") return null;

  const today = new Date();
  let nextDate = new Date(today.getFullYear(), today.getMonth(), this.monthlyEmiDate);

  // if EMI date of this month already passed, move to next month
  if (nextDate <= today) {
    nextDate = new Date(today.getFullYear(), today.getMonth() + 1, this.monthlyEmiDate);
  }

  return nextDate.toISOString(); // ✅ return string so frontend can use directly
});

// ✅ Compute EMI schedule (all months from creation date)
OfflineEMISchema.virtual("emiSchedule").get(function (this: IOfflineEMI) {
  const schedule: { date: string; paid: boolean }[] = [];
  const start = this.createdAt || new Date();

  for (let i = 0; i < this.totalEmis; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, this.monthlyEmiDate);

    // stop if we reached beyond last EMI
    if (i >= this.totalEmis) break;

    schedule.push({
      date: d.toISOString(),
      paid: i < this.emisPaidMonths,
    });
  }

  return schedule;
});


export default mongoose.models.OfflineEMI ||
  mongoose.model<IOfflineEMI>("OfflineEMI", OfflineEMISchema);
