// File: src/app/api/bid/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, workRequestId, amount, message } = body;

    // Validate required fields
    if (!userId || !workRequestId || !amount) {
      return Response.json(
        { error: "Missing required fields: userId, workRequestId, and amount are required" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount)) {
      return Response.json(
        { error: "Amount must be a valid number" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const [bid, workRequest] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          userId,
          workRequestId,
          amount: bidAmount,
          message: message || null, // Store null if message is empty
        },
      }),
      prisma.workRequest.findUnique({
        where: { id: workRequestId },
        select: { userId: true, title: true, status: true }
      })
    ]);

    // Check if work request exists and is open for bids
    if (!workRequest) {
      return Response.json(
        { error: "Work request not found" },
        { status: 404 }
      );
    }

    if (workRequest.status !== 'OPEN') {
      return Response.json(
        { error: "Bids cannot be placed on this work request as it's not open" },
        { status: 400 }
      );
    }

    // Create notification for the council user
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: workRequest.userId,
          type: "NEW_BID",
          message: `New $${bidAmount} bid placed on "${workRequest.title}"`,
          relatedId: workRequestId,
          relatedTitle: workRequest.title,
          relatedType: "WORK_REQUEST",
        }),
      });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Don't fail the request if notification fails
    }

    return Response.json(bid, { status: 201 });

  } catch (error) {
    console.error("Error placing bid:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bids = await prisma.bid.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        workRequest: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json(bids);

  } catch (error) {
    console.error("Error fetching bids:", error);
    return Response.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}
