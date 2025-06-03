// import { auth } from '@/auth'; // Your NextAuth configuration
// import prisma from '@/libs/prisma'; // Your Prisma client
// import { hash, compare } from 'bcryptjs'; // For password hashing and comparison

// export async function POST(request) {
//   const session = await auth();

//   // 1. Authenticate user
//   if (!session || !session.user || !session.user.id) {
//     return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
//   }

//   try {
//     const { currentPassword, newPassword, confirmNewPassword } = await request.json();

//     // 2. Basic Input Validation
//     if (!currentPassword || !newPassword || !confirmNewPassword) {
//       return new Response(JSON.stringify({ message: 'All password fields are required.' }), { status: 400 });
//     }
//     if (newPassword !== confirmNewPassword) {
//       return new Response(JSON.stringify({ message: 'New password and confirmation do not match.' }), { status: 400 });
//     }
//     // Add more robust password validation (e.g., minimum length, complexity)
//     if (newPassword.length < 6) { // Example: minimum 6 characters
//       return new Response(JSON.stringify({ message: 'New password must be at least 6 characters long.' }), { status: 400 });
//     }

//     // 3. Retrieve user from database to verify current password
//     const user = await prisma.user.findUnique({
//       where: { id: session.user.id },
//       select: { password: true }, // Only retrieve the hashed password
//     });

//     if (!user) {
//       return new Response(JSON.stringify({ message: 'User not found.' }), { status: 404 });
//     }

//     // 4. Verify current password
//     const isPasswordValid = await compare(currentPassword, user.password);
//     if (!isPasswordValid) {
//       return new Response(JSON.stringify({ message: 'Current password is incorrect.' }), { status: 401 });
//     }

//     // 5. Hash the new password
//     const hashedNewPassword = await hash(newPassword, 10); // 10 is the salt rounds

//     // 6. Update password in the database
//     await prisma.user.update({
//       where: { id: session.user.id },
//       data: { password: hashedNewPassword },
//     });

//     return new Response(JSON.stringify({ message: 'Password updated successfully!' }), { status: 200 });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
//   }
// }

import { getServerSession } from 'next-auth'; // Correct import for API routes
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import your authOptions
import prisma from '@/libs/prisma'; // Your Prisma client
import { hash, compare } from 'bcryptjs'; // For password hashing and comparison

export async function POST(request) {
  const session = await getServerSession(authOptions); // Use getServerSession with authOptions

  // 1. Authenticate user
  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { currentPassword, newPassword, confirmNewPassword } = await request.json();

    // 2. Basic Input Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return new Response(JSON.stringify({ message: 'All password fields are required.' }), { status: 400 });
    }
    if (newPassword !== confirmNewPassword) {
      return new Response(JSON.stringify({ message: 'New password and confirmation do not match.' }), { status: 400 });
    }
    // Add more robust password validation (e.g., minimum length, complexity)
    if (newPassword.length < 6) { // Example: minimum 6 characters
      return new Response(JSON.stringify({ message: 'New password must be at least 6 characters long.' }), { status: 400 });
    }

    // 3. Retrieve user from database to verify current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }, // Only retrieve the hashed password
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found.' }), { status: 404 });
    }

    // 4. Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: 'Current password is incorrect.' }), { status: 401 });
    }

    // 5. Hash the new password
    const hashedNewPassword = await hash(newPassword, 10); // 10 is the salt rounds

    // 6. Update password in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return new Response(JSON.stringify({ message: 'Password updated successfully!' }), { status: 200 });
  } catch (error) {
    console.error("Error changing password:", error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}