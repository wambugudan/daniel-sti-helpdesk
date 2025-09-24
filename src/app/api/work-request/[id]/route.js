// File: src/app/api/work-request/[id]/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request, {params}) {
  try {
    // const params = await context.params;
    const { id } = await params;

    const userId = request.headers.get('x-user-id'); // 👈 Extract userId from header

    // console.log("Fetching work request with ID:", id, "for user:", userId);

    const workRequest = await prisma.workRequest.findUnique({
      where: { id },
      include: {
        user: true,
        acceptedBid: {
          include: {
            user: true,
            submission: {
              include: {
                messages: {
                  orderBy: { createdAt: "desc" },
                  include: { sender: true }  // <-- ❗ no comma here
                }
              }
            }
          }
        },
        bids: {
          include: { user: true },
          orderBy: { createdAt: "desc" }
        },
        _count: { select: { bids: true } }
      }
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
// export async function DELETE(request, context) {
//   try {
//     const params = await context.params; 
//     const { id } = params;
//     // const { id } = context.params || {};

//     if (!id) {
//       throw new Error("Missing or invalid ID in request parameters");
//     }

//     await prisma.workRequest.delete({
//       where: { id },
//     });

//     return new Response(JSON.stringify({ message: "Deleted successfully" }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error deleting work request:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to delete work request" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

export async function DELETE(request, context) {
    // const { id } = params;
    const params = await context.params; 
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        // Start a transaction to ensure both deletions are atomic
        const result = await prisma.$transaction([
            // First, delete any related records (e.g., Contracts)
            prisma.contract.deleteMany({
                where: { workRequestId: id },
            }),
            // Then, delete the work request itself
            prisma.workRequest.delete({
                where: { id },
            }),
        ]);

        return NextResponse.json({ message: "Work request and related contracts deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting work request:", error);
        if (error.code === 'P2003') { // Correct error code for Foreign Key constraint violation
            return NextResponse.json({ error: "Cannot delete due to related records" }, { status: 409 });
        }
        if (error.code === 'P2025') {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to delete work request" }, { status: 500 });
    }
}