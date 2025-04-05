// File: src/app/api/bid/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, workRequestId, amount, message } = body;

    if (!userId || !workRequestId || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bid = await prisma.bid.create({
      data: {
        userId,
        workRequestId,
        amount: parseFloat(amount),
        message,
      },
    });

    return new Response(JSON.stringify(bid), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    return new Response(JSON.stringify({ error: "Failed to place bid" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
