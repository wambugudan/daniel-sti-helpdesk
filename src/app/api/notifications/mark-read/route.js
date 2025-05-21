// import prisma from "@/libs/prisma";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { notificationIds } = await req.json();

//     if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
//       return NextResponse.json(
//         { error: "Invalid notification IDs" },
//         { status: 400 }
//       );
//     }

//     await prisma.notification.updateMany({
//       where: {
//         id: { in: notificationIds },
//         read: false,
//       },
//       data: { read: true },
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (err) {
//     console.error("Failed to mark notifications as read:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


// File: src/app/api/notifications/mark-read/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 🛡️ 1️⃣ Check if request body is empty:
    const bodyText = await req.text();

    if (!bodyText) {
      console.error("Request body is empty.");
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    // 🛡️ 2️⃣ Attempt to parse JSON:
    let notificationIds;
    try {
      const parsedBody = JSON.parse(bodyText);
      notificationIds = parsedBody.notificationIds;
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 🛡️ 3️⃣ Validation:
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      console.error("Invalid notification IDs");
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        read: false,
      },
      data: { read: true },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Failed to mark notifications as read:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
