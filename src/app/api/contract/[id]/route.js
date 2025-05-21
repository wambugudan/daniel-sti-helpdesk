// File: src/app/api/contract/[id]/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Optional: enables dynamic fetch in dev/prod

export async function GET(request, context) {
  
  // console.log("--- Inside API route GET ---");
  // console.log("Value of prisma at line 7 (approx):", prisma); // Add this
  // console.log("Type of prisma at line 8 (approx):", typeof prisma); // Add this

  try {
    // const { id } = await context.params; // ✅ Await params here
    const { id } =  context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing contract ID" }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        workRequest: true,
        // user: true,
        council: true, // This is the user who initiated the work request
        expert: true,  // This is the user who accepted the bid
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Failed to fetch contract:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
