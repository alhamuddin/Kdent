"use server";

import * as z from "zod";
import { requireDashboardAccess } from "../libs/authorization";
import { prisma } from "../libs/prisma";

const messageIdSchema = z.string().cuid();

export async function getContactInbox() {
  const { role } = await requireDashboardAccess();
  if (role === "ASSISTANT") return { error: "Inbox access is not available for assistants." };

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, email: true, message: true, readAt: true, createdAt: true },
    });
    return {
      messages: messages.map((message) => ({
        ...message,
        readAt: message.readAt?.toISOString() ?? null,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Contact inbox could not be loaded", error);
    return { error: "Inbox messages could not be loaded." };
  }
}

export async function markContactMessageRead(id: string) {
  const { role } = await requireDashboardAccess();
  if (role === "ASSISTANT") return { error: "Inbox access is not available for assistants." };
  const validation = messageIdSchema.safeParse(id);
  if (!validation.success) return { error: "Invalid message." };

  try {
    await prisma.contactMessage.update({
      where: { id: validation.data },
      data: { readAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    console.error("Contact message could not be marked read", error);
    return { error: "Message could not be marked as read." };
  }
}

export async function deleteContactMessage(id: string) {
  const { role } = await requireDashboardAccess();
  if (role === "ASSISTANT") return { error: "Inbox access is not available for assistants." };
  const validation = messageIdSchema.safeParse(id);
  if (!validation.success) return { error: "Invalid message." };

  try {
    await prisma.contactMessage.delete({ where: { id: validation.data } });
    return { success: true };
  } catch (error) {
    console.error("Contact message could not be deleted", error);
    return { error: "Message could not be deleted." };
  }
}
