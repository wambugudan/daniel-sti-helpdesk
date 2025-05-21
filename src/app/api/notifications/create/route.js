// file: src\app\api\notifications\create\route.js

import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, type, message, relatedId, relatedTitle, relatedType, link } = await req.json();

    if (!userId || !type || !message || !relatedId || !relatedTitle || !relatedType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }


    function generateNotificationLink(relatedType, relatedId, type) {
      // Default path
      if (relatedType === "WORK_REQUEST") {
        if (type === "SUBMISSION") {
          return `/my-work-request?requestId=${relatedId}&submission=true`;
        }
        if (type === "MESSAGE") {
          return `/my-work-request?requestId=${relatedId}&message=true`;
        }
        return `/my-work-request?requestId=${relatedId}`;
      }
      
      // if (relatedType === "CONTRACT") {
      //   if (type === "BID_ACCEPTED") {
      //     return `/my-contracts?contractId=${relatedId}`;
      //   }
      //   return `/my-contracts?contractId=${relatedId}`;
      // }

      if (relatedType === "CONTRACT") {
        return `/my-contracts?contractId=${relatedId}`;
      }
    
      console.warn("⚠️ Unhandled notification link type:", { relatedType, type });
      // Default fallback if type is not handled
      return "#";
    }
    
    

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedId,
        relatedTitle,
        relatedType,
        // link: link || generateNotificationLink(relatedType, relatedId),
        link: generateNotificationLink(relatedType, relatedId, type),
        read: false,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.error("Notification creation failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
