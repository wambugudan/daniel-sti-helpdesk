// src/app/api/admin/users/[id]/role/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path

export async function PATCH(req, context) {
//   const session = await getServerSession({ req });
    const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await context.params;
  const { role } = await req.json(); // 'ADMIN', 'EXPERT', 'COUNCIL'

  if (!userId || !role || !['ADMIN', 'EXPERT', 'COUNCIL'].includes(role)) {
    return NextResponse.json({ error: 'Invalid user ID or role provided' }, { status: 400 });
  }

  try {
    // Prevent an admin from demoting themselves (optional but recommended)
    if (session.user.id === userId && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, approved: true },
    });
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}