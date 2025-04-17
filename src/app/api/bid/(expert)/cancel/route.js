// app/api/bid/cancel/route.js
import prisma from "@/libs/prisma";

export async function DELETE(req) {
  try {
    const { bidId, userId } = await req.json();

    if (!bidId || !userId) {
      return new Response(JSON.stringify({ error: "Missing bidId or userId" }), { status: 400 });
    }

    const bid = await prisma.bid.findUnique({ where: { id: bidId } });

    if (!bid || bid.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized or bid not found" }), { status: 403 });
    }

    await prisma.bid.delete({ where: { id: bidId } });

    return new Response(JSON.stringify({ message: "Bid canceled successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cancel bid error:", error);
    return new Response(JSON.stringify({ error: "Failed to cancel bid" }), { status: 500 });
  }
}
