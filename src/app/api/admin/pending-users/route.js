import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    where: {
      approved: false,
      role: { not: 'ADMIN' }, // Don't list other admins
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ users });
}
