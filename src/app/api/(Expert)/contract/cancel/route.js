// src/app/api/contract/cancel/route.js
import prisma from '@/libs/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req) {
  try {
    const { workRequestId, userId } = await req.json();

    if (!workRequestId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Reset acceptedBidId and status to reopen contract
    const updated = await prisma.workRequest.update({
      where: { id: workRequestId },
      data: {
        acceptedBidId: null,
        status: "OPEN", // Or "IN_PROGRESS" if you prefer
      },
    });

    return new Response(JSON.stringify({ message: "Contract cancelled", data: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Cancel contract error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to cancel contract" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
