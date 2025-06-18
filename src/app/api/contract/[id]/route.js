// // File: src/app/api/contract/[id]/route.js
// import prisma from "@/libs/prisma";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// export async function GET(_, { params }) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json({ error: "Missing contract ID" }, { status: 400 });
//     }

//     console.log("🧠 Raw Contract Record:", await prisma.contract.findUnique({ where: { id }, select: { id: true, workRequestId: true }}));


//     // const contract = await prisma.contract.findUnique({
//     //   where: { id },
//     //   include: {
//     //     workRequest: {
//     //       select: {
//     //         id: true,
//     //         title: true,
//     //         category: true,
//     //         budget: true,
//     //         deadline: true,
//     //         user: {
//     //           select: {
//     //             id: true,
//     //             name: true,
//     //             email: true,
//     //           },
//     //         },
//     //       },
//     //     },
//     //     council: true,
//     //     expert: true,
//     //     acceptedBid: {
//     //       include: {
//     //         submission: true,
//     //         user: true,
//     //       },
//     //     },
//     //   },
//     // });
//     const contract = await prisma.contract.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         workRequestId: true, // ✅ add this
//         workRequest: {
//           select: {
//             id: true,
//             title: true,
//             category: true,
//             budget: true,
//             deadline: true,
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//         council: true,
//         expert: true,
//         acceptedBid: {
//           include: {
//             submission: true,
//             user: true,
//           },
//         },
//       },
//     });


//     if (!contract) {
//       return NextResponse.json({ error: "Contract not found" }, { status: 404 });
//     }

//     return NextResponse.json(contract);
//   } catch (error) {
//     console.error("Failed to fetch contract:", error);
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
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        council: true, // Includes all scalar fields of the related Council User
        expert: true,   // Includes all scalar fields of the related Expert User
        acceptedBid: {
          include: {
            submission: { // Now, explicitly go into the submission
              include: {
                messages: { // <--- CRITICAL ADDITION: Include SubmissionMessages here
                  include: {
                    sender: { // For each message, include its sender's details
                      select: {
                        id: true,
                        name: true,
                        role: true,
                      }
                    }
                  },
                  orderBy: {
                    createdAt: 'asc', // Order messages chronologically
                  },
                },
              },
            },
            user: true, // Include the User who placed the accepted bid
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