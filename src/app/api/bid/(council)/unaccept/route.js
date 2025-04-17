import prisma from "@/libs/prisma";

export async function PUT(request) {
  try {
    const { workRequestId, userId } = await request.json();

    if (!workRequestId || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Validate ownership
    const workRequest = await prisma.workRequest.findUnique({ where: { id: workRequestId } });
    if (!workRequest || workRequest.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // Undo accepted bid
    const updated = await prisma.workRequest.update({
      where: { id: workRequestId },
      data: {
        acceptedBidId: null,
        status: "OPEN",
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error unaccepting bid:", error);
    return new Response(JSON.stringify({ error: "Failed to undo accepted bid" }), { status: 500 });
  }
}
