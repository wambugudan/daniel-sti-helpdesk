// app/api/bid/update/route.js
import prisma from "@/libs/prisma";

export async function PUT(req) {
  try {
    const { bidId, amount, message, userId } = await req.json();

    if (!bidId || !userId || amount == null) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const bid = await prisma.bid.findUnique({ where: { id: bidId } });

    if (!bid || bid.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized or bid not found" }), { status: 403 });
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        amount,
        message,
      },
    });

    return new Response(JSON.stringify({ bid: updatedBid }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update bid error:", error);
    return new Response(JSON.stringify({ error: "Failed to update bid" }), { status: 500 });
  }
}
