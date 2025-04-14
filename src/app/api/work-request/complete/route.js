import prisma from "@/libs/prisma";

export async function PUT(request) {
  try {
    const { workRequestId, userId } = await request.json();

    if (!workRequestId || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const requestToUpdate = await prisma.workRequest.findUnique({
      where: { id: workRequestId },
    });

    if (!requestToUpdate || requestToUpdate.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    if (requestToUpdate.status !== "IN_PROGRESS") {
      return new Response(JSON.stringify({ error: "Only in-progress work can be completed" }), { status: 400 });
    }

    const updated = await prisma.workRequest.update({
      where: { id: workRequestId },
      data: {
        status: "CLOSED",
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Error completing work request:", err);
    return new Response(JSON.stringify({ error: "Failed to complete work request" }), { status: 500 });
  }
}
