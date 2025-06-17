// File: src/app/api/workRequests/route.js

import prisma from "@/libs/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    // UPDATED: Get sortByField and sortOrder from searchParams
    const sortByField = searchParams.get("sortByField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc"; // Default to 'desc'
    const searchTerm = searchParams.get("q");

    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (searchTerm) {
      const isPostgres = process.env.NODE_ENV === 'production'; // Assumes production uses PostgreSQL

      const searchConditions = [
        {
          title: {
            contains: searchTerm,
            ...(isPostgres && { mode: 'insensitive' }),
          },
        },
        {
          description: {
            contains: searchTerm,
            ...(isPostgres && { mode: 'insensitive' }),
          },
        },
      ];

      // Add category to search conditions ONLY IF the main category filter is 'ALL' or not set.
      if (!category || category === 'ALL') {
        searchConditions.push({
          category: {
            contains: searchTerm,
            ...(isPostgres && { mode: 'insensitive' }),
          },
        });
      }

      // If a specific category is already selected via the dropdown,
      // the OR conditions for the search term should be combined with an AND
      // with the selected category.
      // Prisma implicitly ANDs properties at the same level.
      // So, if 'where.category' exists, applying 'where.OR' will result in
      // { category: 'X', OR: [...] } which is (category='X' AND (OR conditions))
      if (where.category) {
        where.AND = [
          { category: where.category }, // Ensure the specific category is ANDed
          { OR: searchConditions }
        ];
        delete where.category; // Remove original category from `where` to avoid conflict
      } else {
        where.OR = searchConditions;
      }
    }

    // UPDATED: Dynamic orderBy based on sortByField and sortOrder
    let orderBy = {};
    if (sortByField === "deadline") {
      orderBy = { deadline: sortOrder };
    } else if (sortByField === "bidCount") {
      // For bidCount, we sort by the count of the 'bids' relation
      orderBy = { bids: { _count: sortOrder } };
    } else {
      // Default or 'createdAt'
      orderBy = { createdAt: sortOrder };
    }

    const workRequests = await prisma.workRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: true,
        _count: {
          select: { bids: true },
        },
      },
    });

    const totalCount = await prisma.workRequest.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return new Response(
      JSON.stringify({
        data: workRequests,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          totalResults: totalCount,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching work requests:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work requests", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    // If 'prisma' is a global singleton instance (recommended in Next.js),
    // you should NOT call $disconnect on every request.
    // If "@/libs/prisma" ensures a single, long-lived connection, remove the line below.
    // await prisma.$disconnect();
  }
}