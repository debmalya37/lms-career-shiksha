// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";

export async function GET() {
  await connectMongo();

  // 1) Find all users who have at least one purchaseHistory entry
  const users = await User.find({ "purchaseHistory.0": { $exists: true } })
    .select("name email purchaseHistory")
    // Populate the `course` field inside each PurchaseRecord, pulling in at least `title` and `description`
    .populate({
      path: "purchaseHistory.course",
      select: "title description", // pick exactly the fields you need
    });

  // 2) Flatten out every purchase into an “orders” array
  const orders = users.flatMap((user: any) =>
    user.purchaseHistory.map((purchase: any) => ({
      userName: user.name,
      userEmail: user.email,
      course: {
        id: purchase.course?._id,
        title: purchase.course?.title || "Untitled Course",
        description: purchase.course?.description || "",
      },
      amount: purchase.amount,
      transactionId: purchase.transactionId,
      purchasedAt: purchase.purchasedAt,
    }))
  );

  return NextResponse.json(orders);
}
