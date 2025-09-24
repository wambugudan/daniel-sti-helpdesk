// File: src/app/api/contract/[id]/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_, context) {
  try {
    const { id } = await context.params;

    // console.log("📩 API called: /api/contract/[id]", { id });

    if (!id) {
      console.error("❌ Missing contract ID in request");
      return NextResponse.json({ error: "Missing contract ID" }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        workRequest: {
          select: {
            id: true,
            title: true,
            category: true,
            budget: true,
            deadline: true,
            createdAt: true,
            description: true,
            fileURL: true,
            status: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        council: true,
        expert: true,
        acceptedBid: {
          select: {
            id: true, // ✅ Ensure bidId is present for submissions
            amount: true,
            message: true,
            user: true,
            submission: {
              include: {
                messages: {
                  include: {
                    sender: { select: { id: true, name: true, role: true } },
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!contract) {
      console.warn("⚠️ No contract found for ID:", id);
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // console.log("✅ Contract fetched successfully:", {
    //   id: contract.id,
    //   title: contract.workRequest?.title,
    //   client: contract.council?.name,
    //   expert: contract.expert?.name,
    // });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("💥 Failed to fetch contract:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
