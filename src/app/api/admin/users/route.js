// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { getServerSession } from 'next-auth/next'; // Assuming you use NextAuth.js
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

export async function GET(req) {
//   const session = await getServerSession({ req });
    const session = await getServerSession(authOptions)

  // 1. Basic Authentication Check (already handled by withAdminAuth on client)
  //    But good practice to have it on the server too if not using dedicated middleware.
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true, // You might still want to see their approval status
      },
      orderBy: {
        createdAt: 'desc', // Or by name, or role
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}