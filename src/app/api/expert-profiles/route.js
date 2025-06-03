// src/app/api/experts/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if necessary
import prisma from '@/libs/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  // 1. Authenticate and Authorize
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Ensure the user has the 'COUNCIL' role
  if (session.user.role !== 'COUNCIL') {
    return NextResponse.json({ message: 'Access Denied: Not a Council user' }, { status: 403 });
  }

  try {
    // 2. Fetch Expert Profiles
    const experts = await prisma.user.findMany({
      where: {
        role: 'EXPERT', // Filter for users with the 'EXPERT' role
        approved: true // Optionally, only show approved experts
      },
      select: {
        id: true,
        name: true,
        email: true, // You might or might not want to show email, but it's in your schema
        image: true,
        areaOfProfessionalExperience: true,
        publications: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
        // DO NOT include sensitive data like 'password', 'resetToken', etc.
      },
    });

    return NextResponse.json(experts, { status: 200 });

  } catch (error) {
    console.error("Error fetching experts:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}