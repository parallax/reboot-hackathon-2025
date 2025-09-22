"use server";

import { Resend } from "resend";
import { createClerkClient } from "@clerk/nextjs/server";
import { getItemById } from "@/lib/listings-actions";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ItemData {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  repeatable: boolean;
  active: boolean;
  userId: string;
  userName: string;
  userLocation: string;
  tags: Array<{ id: number; name: string }>;
}

interface SendOfferEmailParams {
  itemId: number;
  offeredItemId: number;
  offerId: number;
  offererUserId: string;
}

export async function sendOfferEmail({ itemId, offeredItemId, offerId }: SendOfferEmailParams) {
  try {
    // Get the item details to include in the email
    const itemResult = await getItemById(itemId);
    
    if (!itemResult.success || !itemResult.data) {
      throw new Error("Failed to fetch item details");
    }

    const item = itemResult.data as ItemData;
    
    // Get the offered item details
    const offeredItemResult = await getItemById(offeredItemId);
    
    if (!offeredItemResult.success || !offeredItemResult.data) {
      throw new Error("Failed to fetch offered item details");
    }

    const offeredItem = offeredItemResult.data as ItemData;

    // Get the item owner's email from Clerk
    let itemOwnerEmail = "user@example.com"; // fallback
    try {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const user = await clerkClient.users.getUser(item.userId);
      if (user && user.emailAddresses && user.emailAddresses.length > 0) {
        itemOwnerEmail = user.emailAddresses[0].emailAddress;
      }
    } catch (error) {
      console.error('Error fetching user email from Clerk:', error);
    }

    // Send email to the item owner
    const { data, error } = await resend.emails.send({
      from: "Swapable <noreply@reboot-hack-2025.parallax.dev>",
      to: [itemOwnerEmail],
      subject: `New offer received for "${item.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔄 Swapable</h1>
            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Swap skills or products, share expertise, and grow together</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #111827; margin: 0 0 20px 0;">You've received a new offer!</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #059669;">
              <h3 style="color: #111827; margin: 0 0 10px 0;">For your item: "${item.title}"</h3>
              <p style="color: #6b7280; margin: 0;">${item.description}</p>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #111827; margin: 0 0 10px 0;">Offered in exchange: "${offeredItem.title}"</h3>
              <p style="color: #6b7280; margin: 0;">${offeredItem.description}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/offers/${offerId}" 
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                View & Respond to Offer
              </a>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>Offer ID:</strong> #${offerId} | 
                <strong>Expires:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This offer was made through Swapable. Visit our platform to manage your offers and connect with other local businesses.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: "Failed to send email notification" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in sendOfferEmail:", error);
    return { success: false, error: "Failed to send email notification" };
  }
}
