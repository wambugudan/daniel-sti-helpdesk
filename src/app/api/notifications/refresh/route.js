// File: src/app/api/notifications/refresh/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ message: "Notifications refreshed" }, { status: 200 });
  } catch (error) {
    console.error("Notification refresh error:", error);
    return NextResponse.json({ error: "Failed to refresh notifications" }, { status: 500 });
  }
}
