// File: src/app/api/submissions/route.js
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { bidId, message, fileURL = null, fileName = null } = body;

    if (!bidId) {
      return NextResponse.json({ error: "Missing bidId" }, { status: 400 });
    }

    const submission = await prisma.submission.upsert({
      where: { bidId },
      update: {
        message,
        fileURL,
        fileName,
        submittedAt: new Date(),
      },
      create: {
        bidId,
        message,
        fileURL,
        fileName,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating submission:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const bidId = searchParams.get("bidId");

    if (!bidId) {
      return NextResponse.json({ error: "Missing bidId" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { bidId },
    });

    return NextResponse.json(submission || null);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
