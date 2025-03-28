import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  try {
    const { params } = context;
    const { id } = await params; // Await params

    console.log("Fetching work request with ID:", id);

    const workRequest = await prisma.workRequest.findUnique({
      where: { id },
    });

    if (!workRequest) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

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

export async function PUT(request, context) {
  try {
    const { params } = context;
    const { id } = params; // Do not await params, destructure directly

    if (!id) {
      throw new Error("Missing or invalid ID in request parameters");
    }

    const requestData = await request.json();
    if (!requestData || typeof requestData !== "object") {
      throw new TypeError("Invalid request payload");
    }

    console.log("Incoming PUT request data:", requestData);
    console.log("Updating work request with ID:", id);

    const { title, description, budget, category, fileURL } = requestData;

    // Validate fields before updating
    if (!title || !description || !budget || !category) {
      throw new Error("Missing required fields in request payload");
    }

    const updatedWorkRequest = await prisma.workRequest.update({
      where: { id },
      data: {
        title,
        description,
        budget: parseFloat(budget), // Ensure budget is a number
        category,
        fileURL: fileURL || undefined, // Use undefined if fileURL is null or empty
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

export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { id } = await params; // Await params

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
