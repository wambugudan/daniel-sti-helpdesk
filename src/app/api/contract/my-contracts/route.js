// // File: src/app/api/(Expert)/my-contracts/route.js
// import prisma from "@/libs/prisma";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");
//     const page = parseInt(searchParams.get("page")) || 1;
//     const limit = parseInt(searchParams.get("limit")) || 5;

//     if (!userId) {
//       return new Response(JSON.stringify({ error: "Missing userId" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const skip = (page - 1) * limit;

//     const [data, total] = await Promise.all([
//       prisma.workRequest.findMany({
//         where: {
//           acceptedBid: {
//             userId,
//           },
//         },
//         include: {
//           acceptedBid: {
//             include: { user: true },
//           },
//           user: true,
//           _count: { select: { bids: true } },
//         },
//         orderBy: { updatedAt: "desc" },
//         skip,
//         take: limit,
//       }),

//       prisma.workRequest.count({
//         where: {
//           acceptedBid: {
//             userId,
//           },
//         },
//       }),
//     ]);

//     return new Response(
//       JSON.stringify({
//         data,
//         total,
//         pagination: {
//           totalPages: Math.ceil(total / limit),
//           page,
//           limit,
//         },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("❌ Failed to fetch expert contracts:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch contracts" }),
//       { status: 500 }
//     );
//   }
// }


// File: src/app/api/(Expert)/my-contracts/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from 'next/server'; // Import NextResponse for better response handling

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // This userId is for the Expert
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Fetch Contract records where the current user is the expert
    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where: {
          expertId: userId, // Filter by the expertId of the contract
        },
        include: {
          // IMPORTANT: Include the related workRequest to get its deadline and createdAt
          workRequest: {
            select: {
              deadline: true,
              createdAt: true,
              title: true, // Also include title for the ContractCard
              budget: true, // Include budget for the ContractCard
            },
          },
          // Include the council (client) user details for the 'Client' field in ContractCard
          council: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          // Include the accepted bid to get the bid amount
          acceptedBid: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" }, // Order by contract creation date
        skip,
        take: limit,
      }),

      // Count total contracts for pagination
      prisma.contract.count({
        where: {
          expertId: userId,
        },
      }),
    ]);

    // Map the fetched contracts to match the expected structure in ContractCard
    // The ContractCard expects `contract.user` for the client, which is `council` in the Contract model.
    const formattedContracts = contracts.map(contract => ({
      ...contract,
      // Map the `council` relation to a `user` property for ContractCard's client display
      user: contract.council,
      // The ContractCard expects `contract.budget` directly.
      // If `budget` is on WorkRequest, you need to map it:
      budget: contract.workRequest.budget, // Assuming budget is on workRequest based on your schema
      title: contract.workRequest.title, // Assuming title is on workRequest
      // If `contract.status` needs to come from `workRequest.status` based on your UI,
      // you might need to map it here, but your `Contract` model also has a `status` field.
      // Based on your ContractCard, it seems `contract.status` is directly on the Contract.
    }));

    return NextResponse.json(
      {
        data: formattedContracts,
        total,
        pagination: {
          totalPages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to fetch expert contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}