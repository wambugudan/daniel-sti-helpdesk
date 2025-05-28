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



import prisma from "@/libs/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "createdAt";

    // ✅ Dynamically construct filters (skip if value is "ALL" or empty)
    const where = {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(category && category !== "ALL" ? { category } : {}),
    };

    // ✅ Sorting options
    const orderBy =
      sortBy === "deadline"
        ? { deadline: "asc" }
        : sortBy === "bidCount"
        ? { bids: { _count: "desc" } }
        : { createdAt: "desc" };

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

    return new Response(
      JSON.stringify({
        data: workRequests,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching work requests:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work requests" }),
      { status: 500 }
    );
  }
}
