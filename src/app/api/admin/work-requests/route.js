// src/app/api/admin/work-requests/route.js
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
    const workRequests = await prisma.workRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }, // Creator (Council)
        _count: {
          select: { bids: true } // Count of bids
        }
      }
    });
    return NextResponse.json({ workRequests });
  } catch (error) {
    console.error('Error fetching work requests:', error);
    return NextResponse.json({ error: 'Failed to fetch work requests' }, { status: 500 });
  }
}
