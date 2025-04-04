// File: src/app/api/my-work-requests/route.js
import prisma from "@/libs/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.workRequest.findMany({
        where: { userId },
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.workRequest.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return new Response(
      JSON.stringify({ data, pagination: { page, limit, totalPages, total } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching user work requests:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work requests" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
