// src/app/api/admin/submissions/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
//   const session = await getServerSession({ req });
    const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        bid: {
          include: {
            user: { select: { name: true, email: true } }, // Expert who submitted
            workRequest: { select: { title: true } } // Related work request
          }
        }
      }
    });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}