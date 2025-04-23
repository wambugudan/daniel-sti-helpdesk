// File: src/app/api/work-request/[id]/route.js
import prisma from "@/libs/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    const userId = request.headers.get('x-user-id'); // 👈 Extract userId from header

    console.log("Fetching work request with ID:", id, "for user:", userId);



    const workRequest = await prisma.workRequest.findUnique({
      where: { id },
      include: {
        user: true,
        acceptedBid: {                // This fetches the winning bid details
          include: {
            user: true,               // Optional: to show who placed the bid
            submission: true,
          },
        },
        bids: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });
    
    

    if (!workRequest) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🛡️ If the current user is not the owner, strip the bids before returning
    if (workRequest.userId !== userId) {
      const { bids, ...rest } = workRequest;
      return new Response(JSON.stringify(rest), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ If user is owner, return everything
    return new Response(JSON.stringify(workRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



// API for handling POST Requests
export async function PUT(request, context) {
  try {
    const { id } = context.params;
    if (!id) throw new Error("Missing or invalid ID in request parameters");

    const requestData = await request.json();
    if (!requestData || typeof requestData !== "object") {
      throw new TypeError("Invalid request payload");
    }

    const { title, description, budget, category, fileURL, deadline, durationDays, userId } = requestData;

    if (!title || !description || !budget || !category || !deadline || !userId) {
      throw new Error("Missing required fields in request payload");
    }

    const updatedWorkRequest = await prisma.workRequest.update({
      where: { id },
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

    return new Response(JSON.stringify(updatedWorkRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update work request", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



// API for handling DELETE Requests
export async function DELETE(request, context) {
  try {
    const params = await context.params; 
    const { id } = params;
    // const { id } = context.params || {};

    if (!id) {
      throw new Error("Missing or invalid ID in request parameters");
    }

    await prisma.workRequest.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
