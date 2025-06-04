// File: src/app/api/admin/approve-user/route.js
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';

export async function POST(req) {
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { approved: true },
  });

  return NextResponse.json({ success: true });
}
