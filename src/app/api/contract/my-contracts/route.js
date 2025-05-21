// File: src/app/api/(Expert)/my-contracts/route.js
import prisma from "@/libs/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.workRequest.findMany({
        where: {
          acceptedBid: {
            userId,
          },
        },
        include: {
          acceptedBid: {
            include: { user: true },
          },
          user: true,
          _count: { select: { bids: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.workRequest.count({
        where: {
          acceptedBid: {
            userId,
          },
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        data,
        total,
        pagination: {
          totalPages: Math.ceil(total / limit),
          page,
          limit,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Failed to fetch expert contracts:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch contracts" }),
      { status: 500 }
    );
  }
}
