// File: src/app/api/check-bid/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const { userId, workRequestId } = await req.json();

    if (!userId || !workRequestId) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingBid = await prisma.bid.findFirst({
      where: { userId, workRequestId },
    });

    return new Response(
      JSON.stringify({ bid: existingBid || null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking bid:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check bid" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
