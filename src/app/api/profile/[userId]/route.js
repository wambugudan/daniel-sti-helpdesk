// File: src/app/api/profile/[userId]/route.js
import { NextResponse } from 'next/server'; // Keep for now, but will use new Response
import prisma from '@/libs/prisma'; // Aligned: Use '@/libs/prisma'

export async function GET(request, { params }) {
    const awaitedParams = await params;
    const { userId } = awaitedParams;

    // console.log('API params:', params);

    if (!userId) {
        return new Response(JSON.stringify({ message: 'User ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { // Select only the fields you want to expose publicly
                id: true,
                name: true,
                email: true, // As in your original profile API, email is returned. Consider if this should be public for all users.
                image: true,
                areaOfProfessionalExperience: true,
                publications: true,
                linkedinUrl: true,
                githubUrl: true,
                websiteUrl: true,
                // Ensure these selected fields match what you want to expose for public profiles.
            },
        });

        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error fetching public user profile:", error); // Specific log message
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}