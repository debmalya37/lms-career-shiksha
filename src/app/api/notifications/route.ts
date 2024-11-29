import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Notification from "@/models/notificationModel";

// POST method to add a notification
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Notification text is required" }, { status: 400 });
    }

    await connectMongo();

    const notification = new Notification({ text, createdAt: new Date() });
    await notification.save();

    return NextResponse.json({ message: "Notification added successfully!" });
  } catch (error) {
    console.error("POST /api/notifications Error:", error);
    return NextResponse.json({ error: "Failed to add notification" }, { status: 500 });
  }
}

// GET method to retrieve notifications
export async function GET() {
  try {
    await connectMongo();

    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/notifications Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
