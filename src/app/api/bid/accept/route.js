import prisma from "@/libs/prisma";

export async function PUT(request) {
  try {
    const { workRequestId, bidId, userId } = await request.json();

    if (!workRequestId || !bidId || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Get the work request and check ownership
    const workRequest = await prisma.workRequest.findUnique({
      where: { id: workRequestId },
    });

    if (!workRequest || workRequest.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // Update the work request to accept the bid
    const updated = await prisma.workRequest.update({
      where: { id: workRequestId },
      data: {
        acceptedBidId: bidId,
        status: "CLOSED",
      },
      include: {
        acceptedBid: {
          include: { user: true },
        },
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error accepting bid:", error);
    return new Response(JSON.stringify({ error: "Failed to accept bid" }), { status: 500 });
  }
}
