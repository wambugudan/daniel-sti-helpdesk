// // File: src/app/api/bid/accept/route.js
// import prisma from "@/libs/prisma";

// export async function PUT(request) {
//   try {
//     const { workRequestId, bidId, userId } = await request.json();

//     if (!workRequestId || !bidId || !userId) {
//       return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
//     }

//     // Get the work request and check ownership
//     const workRequest = await prisma.workRequest.findUnique({
//       where: { id: workRequestId },
//     });

//     if (!workRequest || workRequest.userId !== userId) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
//     }

//     // Update the work request to accept the bid
//     const updated = await prisma.workRequest.update({
//       where: { id: workRequestId },
//       data: {
//         acceptedBidId: bidId,
//         status: "IN_PROGRESS",
//       },
//       include: {
//         acceptedBid: {
//           include: { user: true },
//         },
//       },
//     });

//     return new Response(JSON.stringify(updated), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (error) {
//     console.error("Error accepting bid:", error);
//     return new Response(JSON.stringify({ error: "Failed to accept bid" }), { status: 500 });
//   }
// }


// File: src/app/api/bid/accept/route.js
import prisma from "@/libs/prisma";

export async function PUT(request) {
  try {
    const { workRequestId, bidId, userId } = await request.json();

    if (!workRequestId || !bidId || !userId) {
      return Response.json(
        { error: "Missing required fields: workRequestId, bidId, and userId are required" },
        { status: 400 }
      );
    }

    // Get the work request with bid details
    const workRequest = await prisma.workRequest.findUnique({
      where: { id: workRequestId },
      include: {
        user: { select: { id: true } },
        bids: {
          where: { id: bidId },
          include: { user: true }
        }
      }
    });

    // Validate work request and ownership
    if (!workRequest) {
      return Response.json(
        { error: "Work request not found" },
        { status: 404 }
      );
    }

    if (workRequest.user.id !== userId) {
      return Response.json(
        { error: "Unauthorized: Only the work request owner can accept bids" },
        { status: 403 }
      );
    }

    if (!workRequest.bids.length) {
      return Response.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    const bid = workRequest.bids[0];

    // Update the work request to accept the bid
    const updated = await prisma.workRequest.update({
      where: { id: workRequestId },
      data: {
        acceptedBidId: bidId,
        status: "IN_PROGRESS",
      },
      include: {
        acceptedBid: {
          include: { user: true },
        },
      },
    });

    // Send notification to the expert whose bid was accepted
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: bid.user.id,
          type: "BID_ACCEPTED",
          message: `Your $${bid.amount} bid was accepted for "${workRequest.title}"`,
          relatedId: workRequestId,
          relatedTitle: workRequest.title,
          relatedType: "CONTRACT",
          link: `/contract/${workRequestId}`
        }),
      });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Don't fail the request if notification fails
    }

    return Response.json(updated);

  } catch (error) {
    console.error("Error accepting bid:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}