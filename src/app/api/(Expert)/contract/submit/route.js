// // File: src/app/api/contract/submit/route.js
// import prisma from "@/libs/prisma";

// export async function POST(req) {
//   try {
//     const { workRequestId, userId, message, fileURL } = await req.json();

//     if (!workRequestId || !userId || !message) {
//       return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
//     }

//     // Optional: prevent resubmission if already exists
//     const existing = await prisma.acceptedBid.findFirst({
//       where: { workRequestId, userId },
//     });

//     if (!existing) {
//       return new Response(JSON.stringify({ error: "No accepted bid found" }), { status: 404 });
//     }

//     const updated = await prisma.acceptedBid.update({
//       where: { id: existing.id },
//       data: {
//         submissionMessage: message,
//         submissionFileURL: fileURL || null,
//         submittedAt: new Date(),
//       },
//     });

//     return new Response(JSON.stringify({ submission: updated }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error submitting contract:", error);
//     return new Response(JSON.stringify({ error: "Failed to submit contract" }), { status: 500 });
//   }
// }



// File: src/app/api/contract/submit/route.js
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/libs/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const workRequestId = formData.get("workRequestId");
    const userId = formData.get("userId");
    const message = formData.get("message");
    const file = formData.get("file");

    if (!workRequestId || !userId || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    // Find accepted bid
    const acceptedBid = await prisma.bid.findFirst({
      where: {
        workRequestId,
        userId,
      },
    });

    if (!acceptedBid) {
      return new Response(JSON.stringify({ error: "Accepted bid not found" }), {
        status: 404,
      });
    }

    // Handle file upload
    let fileURL = null;
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);

      await writeFile(filePath, buffer);
      fileURL = `/uploads/${fileName}`;
    }

    // Update accepted bid with submission
    const updated = await prisma.bid.update({
      where: { id: acceptedBid.id },
      data: {
        submissionMessage: message,
        submissionFileURL: fileURL,
        submittedAt: new Date(),
      },
    });

    return new Response(JSON.stringify({ submission: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contract submission error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit contract" }),
      { status: 500 }
    );
  }
}
