import { hash } from 'bcrypt';
import prisma from '@/libs/prisma';

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        approved: false, // require admin approval
      },
    });

    return new Response(JSON.stringify({ message: 'Signup successful' }), { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
