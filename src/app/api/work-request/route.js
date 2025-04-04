// This file handles the creation of work requests in the application.
import prisma from "@/libs/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const requestData = await request.json();

    if (!requestData || typeof requestData !== "object") {
      throw new TypeError("Invalid request payload");
    }

    const { title, description, budget, category, fileURL, deadline, durationDays, userId } = requestData;

    // Basic validation
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
