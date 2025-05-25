// // File: src/app/api/contract/[id]/route.js
// import prisma from "@/libs/prisma";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic"; // Optional: enables dynamic fetch in dev/prod

// export async function GET(request, context) {
  
 
//   try {
//     const { id } =  await context.params;

//     if (!id) {
//       return NextResponse.json({ error: "Missing contract ID" }, { status: 400 });
//     }
    
//     const contract = await prisma.contract.findUnique({
//       where: { id },
//       include: {
//         workRequest: {
//           include: {
//             user: true, // ✅ This is the client/council who posted the work
//           },
//         },
//         council: true,
//         expert: true,
//         acceptedBid: true,
//       },
//     });
    

//     if (!contract) {
//       return NextResponse.json({ error: "Contract not found" }, { status: 404 });
//     }

//     return NextResponse.json(contract);
//   } catch (error) {
//     console.error("Failed to fetch contract:", error);
//     console.log("✅ Loaded contract:", JSON.stringify(contract, null, 2));

//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// File: src/app/api/contract/[id]/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing contract ID" }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        workRequest: {
          select: {
            id: true,
            title: true,
            category: true,
            budget: true,
            deadline: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        council: true,
        expert: true,
        acceptedBid: {
          include: {
            submission: true,
            user: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Failed to fetch contract:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
