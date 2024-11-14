import { clerkClient } from "@clerk/nextjs";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occurred -- missing Svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const webhook = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred while verifying webhook", {
      status: 400,
    });
  }

  // Get the ID and type from the webhook event
  const { id } = evt.data;
  const eventType = evt.type;

  // CREATE
  if (eventType === "user.created") {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data;

    if (!email_addresses[0]?.email_address || !username) {
      return new Response("Error occurred -- missing required user data", {
        status: 400,
      });
    }

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    try {
      const newUser = await createUser(user);

      // Set public metadata if user is created successfully
      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    } catch (err) {
      console.error("Error creating user:", err);
      return new Response("Error occurred while creating user", {
        status: 500,
      });
    }
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { image_url, first_name, last_name, username } = evt.data;

    if (!id) {
      return new Response("Error occurred -- missing user ID", {
        status: 400,
      });
    }

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username!,
      photo: image_url,
    };

    try {
      const updatedUser = await updateUser(id, user);

      return NextResponse.json({ message: "OK", user: updatedUser });
    } catch (err) {
      console.error("Error updating user:", err);
      return new Response("Error occurred while updating user", {
        status: 500,
      });
    }
  }

  // DELETE
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("Error occurred -- missing user ID", {
        status: 400,
      });
    }

    try {
      const deletedUser = await deleteUser(id);

      return NextResponse.json({ message: "OK", user: deletedUser });
    } catch (err) {
      console.error("Error deleting user:", err);
      return new Response("Error occurred while deleting user", {
        status: 500,
      });
    }
  }

  console.log(`Webhook with ID: ${id} and type: ${eventType}`);
  console.log("Webhook body:", body);

  return new Response("Event not handled", { status: 200 });
}
