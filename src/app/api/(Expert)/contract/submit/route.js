// // // File: src/app/api/contract/submit/route.js

// import { writeFile } from "fs/promises";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import prisma from "@/libs/prisma";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req) {
//   try {
//     const formData = await req.formData();

//     const workRequestId = formData.get("workRequestId");
//     const userId = formData.get("userId");
//     const message = formData.get("message");
//     const file = formData.get("file");

//     if (!workRequestId || !userId || !message) {
//       return new Response(JSON.stringify({ error: "Missing fields" }), {
//         status: 400,
//       });
//     }

//     // Find accepted bid
//     const acceptedBid = await prisma.bid.findFirst({
//       where: {
//         workRequestId,
//         userId,
//       },
//     });

//     if (!acceptedBid) {
//       return new Response(JSON.stringify({ error: "Accepted bid not found" }), {
//         status: 404,
//       });
//     }

//     // Handle file upload
//     let fileURL = null;
//     let originalFileName = null;

//     if (file && file.name) {
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const ext = path.extname(file.name);
//       const uniqueFileName = `${uuidv4()}${ext}`;
//       const filePath = path.join(process.cwd(), "public", "uploads", uniqueFileName);

//       await writeFile(filePath, buffer);

//       fileURL = `/uploads/${uniqueFileName}`;
//       originalFileName = file.name; // 🆕 Save original name
//     }

//     // Update bid
//     const updated = await prisma.bid.update({
//       where: { id: acceptedBid.id },
//       data: {
//         submissionMessage: message,
//         submissionFileURL: fileURL,
//         submissionFileName: originalFileName, // 🆕 Save to Prisma
//         submittedAt: new Date(),
//       },
//     });

//     return new Response(JSON.stringify({ submission: updated }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (error) {
//     console.error("Contract submission error:", error);
//     return new Response(
//       JSON.stringify({ error: "Failed to submit contract" }),
//       { status: 500 }
//     );
//   }
// }



// import { writeFile } from "fs/promises";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import prisma from "@/libs/prisma";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req) {
//   try {
//     const formData = await req.formData();

//     const workRequestId = formData.get("workRequestId");
//     const userId = formData.get("userId");
//     const message = formData.get("message");
//     const file = formData.get("file");

//     if (!workRequestId || !userId || !message) {
//       return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
//     }

//     // Find accepted bid
//     const acceptedBid = await prisma.bid.findFirst({
//       where: {
//         workRequestId,
//         userId,
//       },
//     });

//     if (!acceptedBid) {
//       return new Response(JSON.stringify({ error: "Accepted bid not found" }), { status: 404 });
//     }

//     // Check if submission already exists (enforce single submission per bid)
//     const existingSubmission = await prisma.submission.findUnique({
//       where: { bidId: acceptedBid.id },
//     });

//     if (existingSubmission) {
//       return new Response(JSON.stringify({ error: "Submission already exists" }), { status: 409 });
//     }

//     // Handle file upload
//     let fileURL = null;
//     let originalFileName = null;

//     if (file && file.name) {
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const ext = path.extname(file.name);
//       const uniqueFileName = `${uuidv4()}${ext}`;
//       const filePath = path.join(process.cwd(), "public", "uploads", uniqueFileName);

//       await writeFile(filePath, buffer);

//       fileURL = `/uploads/${uniqueFileName}`;
//       originalFileName = file.name;
//     }

//     if (existingSubmission) {
//       // 🛠️ Update
//       const updatedSubmission = await prisma.submission.update({
//         where: { bidId: acceptedBid.id },
//         data: {
//           message,
//           fileURL: fileURL ?? existingSubmission.fileURL,
//           fileName: originalFileName ?? existingSubmission.fileName,
//         },
//       });

//       return new Response(JSON.stringify({ submission: updatedSubmission }), {
//         status: 201,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Create Submission
//     const newSubmission = await prisma.submission.create({
//       data: {
//         bidId: acceptedBid.id,
//         message,
//         fileURL: fileURL ?? "",
//         fileName: originalFileName ?? "",
//       },
//     });

//     return new Response(JSON.stringify({ submission: newSubmission }), {
//       status: 201,
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (error) {
//     console.error("Submission API error:", error);
//     return new Response(JSON.stringify({ error: "Failed to submit work" }), {
//       status: 500,
//     });
//   }
// }


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
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Find accepted bid
    const acceptedBid = await prisma.bid.findFirst({
      where: {
        workRequestId,
        userId,
      },
    });

    if (!acceptedBid) {
      return new Response(JSON.stringify({ error: "Accepted bid not found" }), { status: 404 });
    }

    // Check for existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: { bidId: acceptedBid.id },
    });

    // Handle file upload
    let fileURL = null;
    let originalFileName = null;

    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const uniqueFileName = `${uuidv4()}${ext}`;
      const filePath = path.join(process.cwd(), "public", "uploads", uniqueFileName);

      await writeFile(filePath, buffer);

      fileURL = `/uploads/${uniqueFileName}`;
      originalFileName = file.name;
    }

    if (existingSubmission) {
      // 🛠️ Update
      const updatedSubmission = await prisma.submission.update({
        where: { bidId: acceptedBid.id },
        data: {
          message,
          fileURL: fileURL ?? existingSubmission.fileURL,
          fileName: originalFileName ?? existingSubmission.fileName,
        },
      });

      return new Response(JSON.stringify({ submission: updatedSubmission }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🆕 Create
    const newSubmission = await prisma.submission.create({
      data: {
        bidId: acceptedBid.id,
        message,
        fileURL: fileURL ?? "",
        fileName: originalFileName ?? "",
      },
    });

    return new Response(JSON.stringify({ submission: newSubmission }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Submission API error:", error);
    return new Response(JSON.stringify({ error: "Failed to submit work" }), {
      status: 500,
    });
  }
}
