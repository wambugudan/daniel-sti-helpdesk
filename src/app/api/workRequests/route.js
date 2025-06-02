// // File: src/app/api/workRequests/route.js

// // API for handling GET Requests
// // This API fetches work requests with pagination and sorting options
// import prisma from "@/libs/prisma";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 10;

//     const skip = (page - 1) * limit;

//     const workRequests = await prisma.workRequest.findMany({
//       where: { status: "OPEN" }, // 👈 Only fetch OPEN requests
//       skip,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//       include: {
//         user: true,
//         _count: {
//           select: {
//             bids: true,
//           },
//         },
//       },
//     });
    
//     const totalCount = await prisma.workRequest.count({
//       where: { status: "OPEN" }, // 👈 Match count with filtered results
//     });
    

//     return new Response(
//       JSON.stringify({
//         data: workRequests,
//         pagination: {
//           total: totalCount,
//           page,
//           limit,
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("Error fetching work requests:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work requests" }),
//       { status: 500 }
//     );
//   }
// }



// import prisma from "@/libs/prisma";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 10;
//     const skip = (page - 1) * limit;

//     const status = searchParams.get("status");
//     const category = searchParams.get("category");
//     const sortBy = searchParams.get("sortBy") || "createdAt";

//     // ✅ Dynamically construct filters (skip if value is "ALL" or empty)
//     const where = {
//       ...(status && status !== "ALL" ? { status } : {}),
//       ...(category && category !== "ALL" ? { category } : {}),
//     };

//     // ✅ Sorting options
//     const orderBy =
//       sortBy === "deadline"
//         ? { deadline: "asc" }
//         : sortBy === "bidCount"
//         ? { bids: { _count: "desc" } }
//         : { createdAt: "desc" };

//     const workRequests = await prisma.workRequest.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy,
//       include: {
//         user: true,
//         _count: {
//           select: { bids: true },
//         },
//       },
//     });

//     const totalCount = await prisma.workRequest.count({ where });

//     return new Response(
//       JSON.stringify({
//         data: workRequests,
//         pagination: {
//           total: totalCount,
//           page,
//           limit,
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("❌ Error fetching work requests:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work requests" }),
//       { status: 500 }
//     );
//   }
// }



// File: src/app/api/workRequests/route.js

// import prisma from "@/libs/prisma";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 10;
//     const skip = (page - 1) * limit;

//     const status = searchParams.get("status");
//     const category = searchParams.get("category");
//     const sortBy = searchParams.get("sortBy") || "createdAt";
//     const searchTerm = searchParams.get("q");

//     const where = {};

//     if (status && status !== "ALL") {
//       where.status = status;
//     }

//     if (category && category !== "ALL") {
//       where.category = category;
//     }

//     if (searchTerm) {
//       // Determine if 'mode: insensitive' should be used based on environment
//       // It works for PostgreSQL (production) but not SQLite (development)
//       const isPostgres = process.env.NODE_ENV === 'production'; // Assumes production uses PostgreSQL

//       where.OR = [
//         {
//           title: {
//             contains: searchTerm,
//             ...(isPostgres && { mode: 'insensitive' }), // Apply only if using PostgreSQL
//           },
//         },
//         {
//           description: {
//             contains: searchTerm,
//             ...(isPostgres && { mode: 'insensitive' }), // Apply only if using PostgreSQL
//           },
//         },
//       ];
//     }

//     let orderBy = {};
//     if (sortBy === "deadline") {
//       orderBy = { deadline: "asc" };
//     } else if (sortBy === "bidCount") {
//       orderBy = { bids: { _count: "desc" } };
//     } else {
//       orderBy = { createdAt: "desc" };
//     }

//     const workRequests = await prisma.workRequest.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy,
//       include: {
//         user: true,
//         _count: {
//           select: { bids: true },
//         },
//       },
//     });

//     const totalCount = await prisma.workRequest.count({ where });
//     const totalPages = Math.ceil(totalCount / limit);

//     return new Response(
//       JSON.stringify({
//         data: workRequests,
//         pagination: {
//           total: totalCount,
//           page,
//           limit,
//           totalPages,
//           totalResults: totalCount,
//         },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("❌ Error fetching work requests:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work requests", message: error.message }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   } finally {
//     // If 'prisma' is a global singleton instance (recommended in Next.js),
//     // you should NOT call $disconnect on every request.
//     // If "@/libs/prisma" ensures a single, long-lived connection, remove the line below.
//     // await prisma.$disconnect();
//   }
// }


// // File: src/app/api/workRequests/route.js

// import prisma from "@/libs/prisma";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 10;
//     const skip = (page - 1) * limit;

//     const status = searchParams.get("status");
//     const category = searchParams.get("category");
//     const sortBy = searchParams.get("sortBy") || "createdAt";
//     const searchTerm = searchParams.get("q");

//     const where = {};

//     if (status && status !== "ALL") {
//       where.status = status;
//     }

//     // IMPORTANT: The category filter from the dropdown should still apply independently
//     // from the search term. If the user selects a category AND types a search term,
//     // both filters should narrow the results.
//     // So, we apply the explicit category filter first.
//     if (category && category !== "ALL") {
//       where.category = category;
//     }

//     if (searchTerm) {
//       const isPostgres = process.env.NODE_ENV === 'production'; // Assumes production uses PostgreSQL

//       // If a specific category is already selected, the search terms
//       // should only apply to title/description within that category.
//       // If NO category is selected (i.e., category is 'ALL' or null),
//       // then the search term should also search within the 'category' field.

//       // Define the conditions for the OR array
//       const searchConditions = [
//         {
//           title: {
//             contains: searchTerm,
//             ...(isPostgres && { mode: 'insensitive' }),
//           },
//         },
//         {
//           description: {
//             contains: searchTerm,
//             ...(isPostgres && { mode: 'insensitive' }),
//           },
//         },
//       ];

//       // NEW: Add category to search conditions ONLY IF the main category filter is 'ALL' or not set.
//       // This prevents double-filtering or unexpected behavior if the user selects a category AND searches for it.
//       if (!category || category === 'ALL') {
//         searchConditions.push({
//           category: {
//             contains: searchTerm,
//             ...(isPostgres && { mode: 'insensitive' }),
//           },
//         });
//       }

//       // If a specific category is already selected via the dropdown,
//       // the OR conditions for the search term should be combined with an AND
//       // with the selected category.
//       // This means: (workRequest.category === selectedCategory AND (workRequest.title LIKE searchTerm OR workRequest.description LIKE searchTerm OR workRequest.category LIKE searchTerm))
//       // Prisma allows combining `AND` with `OR` effectively.
//       if (where.category) {
//         // If 'where.category' is already set from the dropdown,
//         // we need to combine the search OR with this existing category AND.
//         // Prisma implicitly ANDs properties at the same level.
//         // So, if 'where.category' exists, applying 'where.OR' will result in
//         // { category: 'X', OR: [...] } which is (category='X' AND (OR conditions))
//         where.OR = searchConditions; // Apply the OR conditions to the existing 'where'
//       } else {
//         // If no specific category is selected, the search conditions form the primary OR
//         where.OR = searchConditions;
//       }
//     }

//     let orderBy = {};
//     if (sortBy === "deadline") {
//       orderBy = { deadline: "asc" };
//     } else if (sortBy === "bidCount") {
//       orderBy = { bids: { _count: "desc" } };
//     } else {
//       orderBy = { createdAt: "desc" };
//     }

//     const workRequests = await prisma.workRequest.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy,
//       include: {
//         user: true,
//         _count: {
//           select: { bids: true },
//         },
//       },
//     });

//     const totalCount = await prisma.workRequest.count({ where });
//     const totalPages = Math.ceil(totalCount / limit);

//     return new Response(
//       JSON.stringify({
//         data: workRequests,
//         pagination: {
//           total: totalCount,
//           page,
//           limit,
//           totalPages,
//           totalResults: totalCount,
//         },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("❌ Error fetching work requests:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work requests", message: error.message }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   } finally {
//     // Review this part:
//     // If 'prisma' is a global singleton instance (recommended in Next.js),
//     // you should NOT call $disconnect on every request.
//     // If "@/libs/prisma" ensures a single, long-lived connection, remove the line below.
//     // await prisma.$disconnect();
//   }
// }



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