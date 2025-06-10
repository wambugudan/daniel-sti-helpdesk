// src/app/api/user/change-password/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { newPassword } = await req.json();
  const userId = session.user.id; // Get user ID from session

  if (!newPassword) {
    return NextResponse.json({ error: 'New password is required' }, { status: 400 });
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
        forcePasswordChange: false, // <--- SET THIS BACK TO FALSE
      },
    });

    return NextResponse.json({ message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
