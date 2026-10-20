"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireAdminAccess, getCurrentUserRole } from "@/app/libs/authorization";
import { prisma } from "@/app/libs/prisma";

export async function listUsersForDoctorManagement(query = "") {
  const { role } = await getCurrentUserRole();
  if (role !== "ADMIN" && role !== "DOCTOR") throw new Error("Only doctors and admins can manage staff accounts.");
  if (role === "ADMIN") {
    const registeredUsers = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        patient: { select: { id: true } },
      },
    });
    const missingProfiles = registeredUsers.filter((user) => !user.patient);
    if (missingProfiles.length) {
      await prisma.patient.createMany({
        data: missingProfiles.map((user) => {
          const [firstName, ...lastNameParts] = user.name.trim().split(/\s+/);
          return {
            patientNumber: `KD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
            firstName: firstName || user.email,
            lastName: lastNameParts.join(" ") || null,
            email: user.email,
            userId: user.id,
            isRegistered: true,
          };
        }),
        skipDuplicates: true,
      });
    }
  }
  const search = typeof query === "string" ? query.trim().slice(0, 100) : "";
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      doctor: { select: { id: true } },
    },
  });
}

export async function deleteUserFromDatabase(userId: string) {
  const { session } = await requireAdminAccess();
  if (typeof userId !== "string" || userId.length < 1 || userId.length > 200)
    return { error: "Invalid user." };
  if (userId === session.user.id)
    return { error: "You cannot delete your own admin account." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, doctor: { select: { id: true } } },
  });
  if (!user) return { error: "This account no longer exists." };
  if (user.role === "ADMIN") return { error: "Admin accounts cannot be deleted here." };

  try {
    await prisma.$transaction(async (transaction) => {
      if (user.doctor) {
        await transaction.prescription.deleteMany({ where: { doctorId: user.doctor.id } });
        await transaction.appointment.deleteMany({ where: { doctorId: user.doctor.id } });
        await transaction.doctorSchedule.deleteMany({ where: { doctorId: user.doctor.id } });
        await transaction.doctor.delete({ where: { id: user.doctor.id } });
      }
      await transaction.user.delete({ where: { id: user.id } });
    });
  } catch (error) {
    console.error("User account could not be deleted", error);
    return { error: "The account could not be deleted. Refresh and try again." };
  }

  revalidatePath("/dashboard");
  return { success: `${user.name} and their account profile were deleted.` };
}

export async function promoteUserToDoctor(userId: string) {
  await requireAdminAccess();
  if (typeof userId !== "string" || userId.length < 1 || userId.length > 200) {
    return { error: "Invalid user." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return { error: "This account no longer exists." };
  if (user.role !== "USER") return { error: "Only user accounts can be promoted to doctor." };

  const [firstName, ...lastNameParts] = user.name.trim().split(/\s+/);
  const promoted = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: user.id, role: "USER" },
      data: { role: "DOCTOR", updatedAt: new Date() },
    });
    if (updated.count !== 1) return false;
    await tx.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        firstName: firstName || user.email,
        lastName: lastNameParts.join(" ") || null,
        email: user.email,
        userId: user.id,
      },
    });
    return true;
  });
  if (!promoted) return { error: "This account role changed. Refresh the user list and try again." };

  revalidatePath("/dashboard");
  return { success: `${user.name} can now access the doctor dashboard.` };
}

export async function removeDoctorAccess(userId: string) {
  await requireAdminAccess();
  if (typeof userId !== "string" || userId.length < 1 || userId.length > 200) {
    return { error: "Invalid user." };
  }

  const result = await prisma.user.updateMany({
    where: { id: userId, role: "DOCTOR" },
    data: { role: "USER", updatedAt: new Date() },
  });
  if (!result.count) return { error: "This doctor account could not be found or has already changed roles." };

  revalidatePath("/dashboard");
  return { success: "Doctor access removed. The account and clinical history were preserved." };
}

async function requireAssistantManager() {
  const { role } = await getCurrentUserRole();
  if (role !== "ADMIN" && role !== "DOCTOR") throw new Error("Only a doctor or admin can manage assistants.");
}

export async function addAssistant(userId: string) {
  await requireAssistantManager();
  if (!userId || userId.length > 200) return { error: "Invalid user." };
  const result = await prisma.user.updateMany({ where: { id: userId, role: "USER" }, data: { role: "ASSISTANT", updatedAt: new Date() } });
  if (!result.count) return { error: "Choose an available user account." };
  revalidatePath("/dashboard");
  return { success: "Assistant access added." };
}

export async function removeAssistant(userId: string) {
  await requireAssistantManager();
  if (!userId || userId.length > 200) return { error: "Invalid user." };
  const result = await prisma.user.updateMany({ where: { id: userId, role: "ASSISTANT" }, data: { role: "USER", updatedAt: new Date() } });
  if (!result.count) return { error: "This assistant account could not be found or has already changed roles." };
  revalidatePath("/dashboard");
  return { success: "Assistant access removed." };
}
