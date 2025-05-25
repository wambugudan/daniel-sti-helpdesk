
// File: src/app/api/contract/submit/route.js
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

//     // Validate required fields
//     if (!workRequestId || !userId || !message) {
//       return Response.json(
//         { error: "Missing required fields: workRequestId, userId, and message are required" },
//         { status: 400 }
//       );
//     }

//     // Get work request and bid in a single transaction
//     const [workRequest, acceptedBid] = await prisma.$transaction([
//       prisma.workRequest.findUnique({
//         where: { id: workRequestId },
//         select: { id: true, userId: true, title: true }
//       }),
//       prisma.bid.findFirst({
//         where: { workRequestId, userId },
//         select: { id: true, user: true }
//       })
//     ]);

//     if (!acceptedBid) {
//       return Response.json(
//         { error: "No accepted bid found for this work request and user" },
//         { status: 404 }
//       );
//     }

//     // Handle file upload
//     let fileURL = null;
//     let originalFileName = null;

//     if (file && file.name) {
//       // Validate file size (e.g., 5MB max)
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       const buffer = Buffer.from(await file.arrayBuffer());
      
//       if (buffer.length > maxSize) {
//         return Response.json(
//           { error: "File size exceeds 5MB limit" },
//           { status: 400 }
//         );
//       }

//       const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
//       const ext = path.extname(file.name).toLowerCase();
      
//       if (!allowedExtensions.includes(ext)) {
//         return Response.json(
//           { error: "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG" },
//           { status: 400 }
//         );
//       }

//       const uniqueFileName = `${uuidv4()}${ext}`;
//       const filePath = path.join(process.cwd(), "public", "uploads", uniqueFileName);
//       await writeFile(filePath, buffer);

//       fileURL = `/uploads/${uniqueFileName}`;
//       originalFileName = file.name;
//     }

//     // Create or update submission
//     const submissionData = {
//       message,
//       ...(fileURL && { fileURL, fileName: originalFileName })
//     };

//     const submission = await prisma.submission.upsert({
//       where: { bidId: acceptedBid.id },
//       create: {
//         bidId: acceptedBid.id,
//         ...submissionData
//       },
//       update: submissionData
//     });

//     // Send notification to the council
//     try {
//       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: workRequest.userId,
//           type: "SUBMISSION",
//           message: `New work submitted for "${workRequest.title}"`,
//           relatedId: workRequest.id,
//           relatedTitle: workRequest.title,
//           relatedType: "CONTRACT",
//           link: `/contract/${workRequest.id}?submission=true`
//         }),
//       });
//     } catch (notificationError) {
//       console.error("Notification failed:", notificationError);
//       // Continue even if notification fails
//     }

//     return Response.json(
//       { submission },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error("Submission error:", error);
//     return Response.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId");
    const workRequestId = formData.get("workRequestId");
    const message = formData.get("message");
    const file = formData.get("file");

    if (!userId || !workRequestId) {
      return NextResponse.json({ error: "Missing userId or workRequestId" }, { status: 400 });
    }

    // ✅ Find the active contract
    const contract = await prisma.contract.findFirst({
      where: {
        expertId: userId,
        workRequestId,
        status: "ACTIVE", 
      },
      include: {
        acceptedBid: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "No accepted bid found for this work request and user" },
        { status: 404 }
      );
    }

    // ✅ Handle file upload
    let fileURL = "";
    let fileName = "";
    if (file && typeof file === "object") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueName = `${uuid()}-${file.name}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", uniqueName);

      await writeFile(uploadPath, buffer);

      fileURL = `/uploads/${uniqueName}`;
      fileName = file.name;
    }

    // ✅ Create or update the submission (because it's one-to-one per bid)
    const existingSubmission = await prisma.submission.findUnique({
      where: { bidId: contract.acceptedBidId },
    });

    const submission = existingSubmission
      ? await prisma.submission.update({
          where: { bidId: contract.acceptedBidId },
          data: {
            message,
            fileURL,
            fileName,
            submittedAt: new Date(),
          },
        })
      : await prisma.submission.create({
          data: {
            bidId: contract.acceptedBidId,
            message,
            fileURL,
            fileName,
            submittedAt: new Date(),
          },
        });

    return NextResponse.json({ message: "Submission saved", submission }, { status: 201 });
  } catch (error) {
    console.error("❌ Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
