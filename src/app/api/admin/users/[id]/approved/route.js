// File: src/app/api/admin/users/[id]/approved/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma'; // Ensure this path is correct
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ensure this path is correct

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);

  // 1. Authorization: Only allow ADMINs to perform this action
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;
  const { approved } = await req.json(); // Get the new approved state from the request body

  // 2. Input Validation
  if (!userId || typeof approved !== 'boolean') { // Ensure 'approved' is a boolean
    return NextResponse.json({ error: 'Invalid user ID or approved status provided' }, { status: 400 });
  }

  // Optional: Prevent admin from unapproving themselves
  // This is a safety measure to prevent an admin from locking themselves out.
  if (session.user.id === userId && approved === false) {
    return NextResponse.json({ error: 'You cannot unapprove your own admin account.' }, { status: 403 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { approved: approved }, // Update the 'approved' field
      select: { id: true, name: true, email: true, approved: true, role: true }, // Select relevant fields to return
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user approved status:', error);
    // More specific error for Prisma errors (e.g., record not found)
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update user approved status.' }, { status: 500 });
  }
}