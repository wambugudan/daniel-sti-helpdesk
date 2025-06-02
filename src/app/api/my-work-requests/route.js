// // File: src/app/api/my-work-requests/route.js
// import prisma from "@/libs/prisma";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const userId = searchParams.get("userId");
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 5;

//     if (!userId) {
//       return new Response(
//         JSON.stringify({ error: "Missing userId parameter" }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     const skip = (page - 1) * limit;

//     const [data, total] = await Promise.all([
//       prisma.workRequest.findMany({
//         where: { userId },
//         include: {
//           user: true,
//           bids: true, // 👈 Include bid objects
//           _count: {
//             select: { bids: true }, // 👈 Include bid count
//           },
//         },
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.workRequest.count({ where: { userId } }),
//     ]);

//     const totalPages = Math.ceil(total / limit);

//     return new Response(
//       JSON.stringify({ data, pagination: { page, limit, totalPages, total } }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("Error fetching user work requests:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work requests" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }


// File: src/app/api/my-work-requests/route.js
import prisma from "@/libs/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;

    // NEW: Get filter/sort parameters
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const searchTerm = searchParams.get("q");
    const sortByField = searchParams.get("sortByField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const skip = (page - 1) * limit;

    const where = {
      userId: userId // Always filter by the current user's ID
    };

    // Apply status filter if not 'ALL'
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Apply category filter if not 'ALL'
    if (category && category !== "ALL") {
      where.category = category;
    }

    // Apply search term logic
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

      // Only search in category field if no specific category is selected
      if (!category || category === 'ALL') {
        searchConditions.push({
          category: {
            contains: searchTerm,
            ...(isPostgres && { mode: 'insensitive' }),
          },
        });
      }

      // Combine existing 'where' conditions (userId, status, category) with search 'OR' conditions
      // Prisma's `AND` allows combining multiple conditions including an `OR` block.
      where.AND = [
        ...Object.keys(where).map(key => ({ [key]: where[key] })), // Convert existing `where` object to an array of AND conditions
        { OR: searchConditions }
      ];

      // After moving existing 'where' properties to `where.AND`, clear the original 'where' properties
      // except for `OR` if it was the only one.
      for (const key in where) {
          if (key !== 'AND' && Object.hasOwnProperty.call(where, key)) {
              delete where[key];
          }
      }
      // This is a bit tricky; a simpler approach would be to build the `AND` array from scratch
      // and only add the `OR` condition if `searchTerm` exists.
      // Let's refine this `where` clause construction for clarity:

      const finalWhere = {
        userId: userId
      };

      if (status && status !== "ALL") {
        finalWhere.status = status;
      }

      if (category && category !== "ALL") {
        finalWhere.category = category;
      }

      if (searchTerm) {
        const orConditions = [
          { title: { contains: searchTerm, ...(isPostgres && { mode: 'insensitive' }) } },
          { description: { contains: searchTerm, ...(isPostgres && { mode: 'insensitive' }) } },
        ];
        if (!category || category === 'ALL') { // Only search category if not already filtered by it
          orConditions.push({ category: { contains: searchTerm, ...(isPostgres && { mode: 'insensitive' }) } });
        }
        finalWhere.AND = [
          ...Object.keys(finalWhere).filter(k => k !== 'AND').map(key => ({ [key]: finalWhere[key] })), // Existing ANDs
          { OR: orConditions }
        ];
        // After constructing the AND array, delete top-level props that are now inside AND
        Object.keys(finalWhere).forEach(key => {
            if (key !== 'AND') delete finalWhere[key];
        });
      }

      // Reset 'where' to the refined finalWhere
      Object.assign(where, finalWhere);
    }


    // Determine orderBy based on sortByField and sortOrder
    let orderBy = {};
    if (sortByField === "deadline") {
      orderBy = { deadline: sortOrder };
    } else if (sortByField === "bidCount") {
      orderBy = { bids: { _count: sortOrder } };
    } else if (sortByField === "updatedAt") { // If you added 'updatedAt' to sortOptions
      orderBy = { updatedAt: sortOrder };
    }
    else {
      orderBy = { createdAt: sortOrder }; // Default sort
    }

    const [data, total] = await Promise.all([
      prisma.workRequest.findMany({
        where,
        include: {
          user: true,
          _count: {
            select: { bids: true },
          },
        },
        skip,
        take: limit,
        orderBy, // Apply the dynamic orderBy
      }),
      prisma.workRequest.count({ where }), // Ensure count uses the same `where` clause
    ]);

    const totalPages = Math.ceil(total / limit);

    return new Response(
      JSON.stringify({ data, pagination: { page, limit, totalPages, total } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching user work requests:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work requests", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}