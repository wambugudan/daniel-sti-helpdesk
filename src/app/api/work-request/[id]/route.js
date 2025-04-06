import prisma from "@/libs/prisma";


export const dynamic = 'force-dynamic';

// API for handling GET Work Request to be edited
// export async function GET(request, context) {
//   try {
//     const params = await context.params; 
//     const { id } = params;

//     // const { id } = context.params || {};


//     console.log("Fetching work request with ID:", id);

//     const workRequest = await prisma.workRequest.findUnique({
//       where: { id },
//     });

//     if (!workRequest) {
//       return new Response(JSON.stringify({ error: "Not Found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     return new Response(JSON.stringify(workRequest), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error fetching work request:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work request" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

export async function GET(request, context) {
  try {
    // const { id } = context.params;
    const params = await context.params;
    const { id } = params;

    console.log("Fetching work request with ID:", id);

    const workRequest = await prisma.workRequest.findUnique({
      where: { id },
      include: {
        user: true, // Include council user
        bids: {
          include: {
            user: true, // Include expert info for each bid
          },
          orderBy: {
            createdAt: 'desc', // Show most recent bids first
          },
        },
      },
    });

    if (!workRequest) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(workRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// export async function GET(request, context) {
//   try {
//     // const { id } = context.params;
//     const params = await context.params;
//     const { id } = params;

//     const userId = request.headers.get('x-user-id'); // 🆕 Get userId from header

//     if (!userId) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
//     }

//     // Fetch work request with user (council) and bids
//     const workRequest = await prisma.workRequest.findUnique({
//       where: { id },
//       include: {
//         user: true,
//         bids: {
//           include: { user: true },
//           orderBy: { createdAt: "desc" },
//         },
//       },
//     });

//     if (!workRequest) {
//       return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
//     }

//     // 🔐 Check if user making the request is the owner
//     if (workRequest.userId !== userId) {
//       // Return limited workRequest without bids
//       const { bids, ...rest } = workRequest;
//       return new Response(JSON.stringify(rest), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // ✅ If user is owner, return full work request with bids
//     return new Response(JSON.stringify(workRequest), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (error) {
//     console.error("Error fetching work request:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to fetch work request" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }



// API for handling POST Requests
export async function PUT(request, context) {
  try {
    const { id } = context.params;
    if (!id) throw new Error("Missing or invalid ID in request parameters");

    const requestData = await request.json();
    if (!requestData || typeof requestData !== "object") {
      throw new TypeError("Invalid request payload");
    }

    const { title, description, budget, category, fileURL, deadline, durationDays, userId } = requestData;

    if (!title || !description || !budget || !category || !deadline || !userId) {
      throw new Error("Missing required fields in request payload");
    }

    const updatedWorkRequest = await prisma.workRequest.update({
      where: { id },
      data: {
        title,
        description,
        budget: String(budget),
        category,
        fileURL: fileURL || null,
        deadline: new Date(deadline),
        durationDays: durationDays ?? null,
        userId,
      },
    });

    return new Response(JSON.stringify(updatedWorkRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update work request", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



// API for handling DELETE Requests
export async function DELETE(request, context) {
  try {
    const params = await context.params; 
    const { id } = params;
    // const { id } = context.params || {};

    if (!id) {
      throw new Error("Missing or invalid ID in request parameters");
    }

    await prisma.workRequest.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting work request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete work request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
