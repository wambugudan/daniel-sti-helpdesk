import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch work requests with associated user data (optional)
    const workRequests = await prisma.workRequest.findMany({
      include: {
        user: true, // Include user details if needed
      },
    });

    return Response.json(workRequests);
  } catch (error) {
    console.error("Error fetching work requests:", error);
    return Response.json({ error: "Failed to fetch work requests" }, { status: 500 });
  }
}
