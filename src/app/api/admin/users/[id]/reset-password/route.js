// // src/app/api/admin/users/[id]/reset-password/route.js
// import { NextResponse } from 'next/server';
// import prisma from '@/libs/prisma';
// import bcrypt from 'bcrypt'; // You need to install bcrypt: npm install bcrypt
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path

// export async function POST(req, context) {
// //   const session = await getServerSession({ req });
//     const session = await getServerSession(authOptions)

//   // Admin authorization check
//   if (!session || session.user.role !== 'ADMIN') {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { id: userId } = await context.params;
//   const { newPassword } = await req.json(); // Admin provides the new password

//   if (!userId || !newPassword) {
//     return NextResponse.json({ error: 'Missing userId or newPassword' }, { status: 400 });
//   }

//   // Basic password strength validation (add more robust validation)
//   if (newPassword.length < 8) {
//     return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
//   }

//   try {
//     // Hash the new password before storing it
//     const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds: 10 is good

//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         password: hashedPassword,
//         // No need to clear resetPasswordToken/Expires as they don't exist
//       },
//     });

//     return NextResponse.json({ message: 'User password reset successfully.' });

//   } catch (error) {
//     console.error('Error resetting user password:', error);
//     return NextResponse.json({ error: 'Failed to reset user password' }, { status: 500 });
//   }
// }


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