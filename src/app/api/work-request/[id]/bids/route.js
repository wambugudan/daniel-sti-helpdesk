// // File: src/app/api/work-request/[id]/bids/route.js

// import prisma from "@/libs/prisma";

// export async function GET(req, { params }) {
//   const { id } = params;

//   try {
//     const bids = await prisma.bid.findMany({
//       where: { workRequestId: id },
//       include: { user: true }, // optional: show expert info
//     });

//     return new Response(JSON.stringify(bids), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Failed to fetch bids:", error);
//     return new Response(JSON.stringify({ error: "Failed to fetch bids" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }


// File: src/app/api/work-request/[id]/bids/route.js

import prisma from "@/libs/prisma";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const bids = await prisma.bid.findMany({
      where: { workRequestId: id },
      include: { user: true },
      orderBy: { createdAt: "desc" } // 🆕 Sort bids by newest first
    });

    return new Response(JSON.stringify(bids), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch bids:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bids" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
