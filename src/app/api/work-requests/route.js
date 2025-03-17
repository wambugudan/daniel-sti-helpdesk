import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_, { params }) {
  try {
    const workRequest = await prisma.workRequest.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!workRequest) return new Response("Not Found", { status: 404 });

    return Response.json(workRequest);
  } catch (error) {
    console.error("Error fetching work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { title, description, budget, category, fileURL } = await req.json();

    const updatedWorkRequest = await prisma.workRequest.update({
      where: { id: parseInt(params.id) },
      data: { title, description, budget, category, fileURL },
    });

    return Response.json(updatedWorkRequest);
  } catch (error) {
    console.error("Error updating work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    await prisma.workRequest.delete({
      where: { id: parseInt(params.id) },
    });

    return new Response("Deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
