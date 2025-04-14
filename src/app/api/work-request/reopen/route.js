import prisma from "@/libs/prisma";

export async function PUT(request) {
  try {
    const { workRequestId, userId } = await request.json();

    if (!workRequestId || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const workRequest = await prisma.workRequest.findUnique({
      where: { id: workRequestId },
    });

    if (!workRequest || workRequest.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const updated = await prisma.workRequest.update({
      where: { id: workRequestId },
      data: {
        status: "IN_PROGRESS",
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error reopening work:", error);
    return new Response(
      JSON.stringify({ error: "Failed to reopen work" }),
      { status: 500 }
    );
  }
}
