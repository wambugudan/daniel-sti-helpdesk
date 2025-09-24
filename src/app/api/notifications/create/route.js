
// file: src/app/api/notifications/create/route.js

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

    /**
     * Generates a notification link based on the related type, ID, notification type, and recipient user's ID.
     * It handles conditional linking for expert users receiving messages related to work requests,
     * directing them to their contracts page if a relevant contract exists.
     *
     * @param {string} relatedType - The type of entity the notification is related to (e.g., "WORK_REQUEST", "CONTRACT").
     * @param {string} relatedId - The ID of the related entity (e.g., workRequestId, contractId).
     * @param {string} type - The specific type of notification (e.g., "MESSAGE", "SUBMISSION").
     * @param {string} recipientUserId - The ID of the user who will receive the notification.
     * @returns {Promise<string>} The generated URL for the notification.
     */
    async function generateNotificationLink(relatedType, relatedId, type, recipientUserId) {
      if (relatedType === "WORK_REQUEST") {
        if (type === "SUBMISSION") {
          return `/my-work-request?requestId=${relatedId}&submission=true`;
        }
        if (type === "MESSAGE") {
          // Fetch the recipient user's role to determine the correct link
          const recipientUser = await prisma.user.findUnique({
            where: { id: recipientUserId },
            select: { role: true },
          });

          if (recipientUser && recipientUser.role === "EXPERT") {
            // If the recipient is an expert and the message is related to a WORK_REQUEST,
            // try to find an associated contract for this expert and work request.
            const contract = await prisma.contract.findFirst({
              where: {
                workRequestId: relatedId, // The relatedId is a workRequestId in this branch
                acceptedBid: {
                  is: { // Use 'is' to filter on fields of the related 'Bid' model
                    userId: recipientUserId, // Filter by the expert's ID (userId on the Bid model)
                  },
                },
              },
              select: { id: true }, // Select only the contract ID
            });

            if (contract) {
              // If a contract exists for this expert and work request, link to the contracts page
              return `/my-contracts?contractId=${contract.id}&message=true`;
            } else {
              // Fallback to the work request page if no specific contract is found
              return `/my-work-request?requestId=${relatedId}&message=true`;
            }
          } else {
            // If the recipient is not an expert, or no role found, default to work request page
            return `/my-work-request?requestId=${relatedId}&message=true`;
          }
        }
        if (type === "NEW_BID") {
          return `/my-work-request?requestId=${relatedId}&bid=true`;
        }
        return `/my-work-request?requestId=${relatedId}`;
      }
      
      if (relatedType === "CONTRACT") {
        // Notifications related to a contract (e.g., BID_ACCEPTED, direct message)
        // should always link to the contracts page
        return `/my-contracts?contractId=${relatedId}`;
      }
    
      console.warn("⚠️ Unhandled notification link type:", { relatedType, type });
      // Default fallback if the notification type or relatedType is not handled
      return "#";
    }
    
    // Generate the notification link using the new async function and passing userId
    const generatedLink = await generateNotificationLink(relatedType, relatedId, type, userId);

    // Create the notification record in the database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedId,
        relatedTitle,
        relatedType,
        link: generatedLink, // Use the dynamically generated link
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