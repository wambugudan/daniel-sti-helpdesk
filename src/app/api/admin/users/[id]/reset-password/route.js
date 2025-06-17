// src/app/api/admin/users/[id]/reset-password/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req, context) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // const { id: userId } = params;
  const { id: userId } = await context.params;
  const { newPassword } = await req.json();

  if (!userId || !newPassword) {
    return NextResponse.json({ error: 'Missing userId or newPassword' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forcePasswordChange: true, // <--- SET THIS TO TRUE
      },
    });

    return NextResponse.json({ message: 'User password reset successfully.' });

  } catch (error) {
    console.error('Error resetting user password:', error);
    return NextResponse.json({ error: 'Failed to reset user password' }, { status: 500 });
  }
}