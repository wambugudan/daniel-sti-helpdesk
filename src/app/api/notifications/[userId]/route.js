import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    // const userId = params.userId;
    // const { params } = context;
    const {userId} = await context.params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
