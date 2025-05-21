import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      workRequestId,
      acceptedBidId,
      councilId,
      expertId,
      endDate,
      finalAmount
    } = await req.json();

    // Basic validation
    if (!workRequestId || !acceptedBidId || !councilId || !expertId || !endDate || !finalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure workRequest, bid, and users exist
    const [workRequest, bid, council, expert] = await Promise.all([
      prisma.workRequest.findUnique({ where: { id: workRequestId } }),
      prisma.bid.findUnique({ where: { id: acceptedBidId } }),
      prisma.user.findUnique({ where: { id: councilId } }),
      prisma.user.findUnique({ where: { id: expertId } }),
    ]);

    if (!workRequest || !bid || !council || !expert) {
      return NextResponse.json(
        { error: "Invalid reference to work request, bid, or users" },
        { status: 404 }
      );
    }

    // Create the contract
    const contract = await prisma.contract.create({
      data: {
        workRequestId,
        acceptedBidId,
        councilId,
        expertId,
        endDate: new Date(endDate),
        finalAmount: parseFloat(finalAmount),
      },
      include: {
        workRequest: true,
        council: true,
        expert: true,
        acceptedBid: true,
      },
    });

    return NextResponse.json(contract, { status: 201 });

  } catch (error) {
    console.error("Contract creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
