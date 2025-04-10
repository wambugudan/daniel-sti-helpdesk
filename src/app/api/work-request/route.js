// Import necessary modules and libraries

import prisma from "@/libs/prisma";

export const dynamic = 'force-dynamic';

// GET handler: Fetch all work requests (you can apply pagination or user filtering here if needed)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // const whereClause = userId ? { userId } : {};
    
    // Show only open work requests
    const whereClause = {
      ...(userId ? { userId } : {}),
      status: "OPEN", // Only show open work requests
    };

    const [data, total] = await Promise.all([
      prisma.workRequest.findMany({
        where: whereClause,
        include: {
          user: true,
          _count: {               // Counting number of bids for each work request
            select: { bids: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workRequest.count({ where: whereClause }),
    ]); 
    
    
    return new Response(JSON.stringify({ data, total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Failed to fetch work requests:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch work requests" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST handler (existing)
export async function POST(request) {
  try {
    const requestData = await request.json();

    if (!requestData || typeof requestData !== "object") {
      throw new TypeError("Invalid request payload");
    }

    const { title, description, budget, category, fileURL, deadline, durationDays, userId } = requestData;

    if (!title || !description || !budget || !category || !deadline || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newWorkRequest = await prisma.workRequest.create({
      data: {
        title,
        description,
        budget: String(budget),
        category,
        fileURL: fileURL || null,
        deadline: new Date(deadline),
        durationDays: durationDays ?? null,
        userId,
      },
    });

    return new Response(JSON.stringify(newWorkRequest), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create work request", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
