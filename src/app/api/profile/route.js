// File: src/app/api/profile/route.js
import { getServerSession } from 'next-auth'; // Correct import for API routes
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import authOptions
import prisma from '@/libs/prisma'; // Adjust path to your Prisma client

// GET handler to fetch the current user's profile
export async function GET(request) {
  // Use getServerSession with your authOptions to get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { // Select all fields you want to expose/return for the profile
        id: true,
        email: true,
        name: true,
        image: true,
        areaOfProfessionalExperience: true,
        publications: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
        // Do NOT select 'password' or other sensitive fields
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'User profile not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// PATCH handler to update the current user's profile
export async function PATCH(request) {
  // Use getServerSession with your authOptions to get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    // Destructure all fields that are allowed to be updated
    const {
      name,
      image,
      areaOfProfessionalExperience,
      publications,
      linkedinUrl,
      githubUrl,
      websiteUrl,
    } = body;

    // Build an object with only the fields that were actually provided in the request body
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (areaOfProfessionalExperience !== undefined) updateData.areaOfProfessionalExperience = areaOfProfessionalExperience;
    if (publications !== undefined) updateData.publications = publications;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;

    // Ensure there's something to update to avoid empty update calls to Prisma
    if (Object.keys(updateData).length === 0) {
        return new Response(JSON.stringify({ message: 'No fields provided for update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { // Select the fields you want to return after update
        id: true,
        email: true,
        name: true,
        image: true,
        areaOfProfessionalExperience: true,
        publications: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
      },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}