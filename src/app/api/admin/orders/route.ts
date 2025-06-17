// app/api/admin/orders/route.ts

export const dynamic = "force-dynamic"; // 🚀 disables static caching for this route

import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";

export async function GET() {
  await connectMongo();

  const users = await User.find({ "purchaseHistory.0": { $exists: true } })
    .select("name email purchaseHistory")
    .populate({
      path: "purchaseHistory.course",
      select: "title description",
    });

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
