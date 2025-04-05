// File: src/app/api/my-bids/[userId]/route.js
// Route: GET /api/my-bids/:userId
// Description: Get all bids made by a user

import prisma from "@/libs/prisma";

export async function GET(req, { params }) {
  const { userId } = params;

  try {
    const bids = await prisma.bid.findMany({
      where: { userId },
      include: { workRequest: true },
    });

    return new Response(JSON.stringify(bids), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch expert bids:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bids" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
