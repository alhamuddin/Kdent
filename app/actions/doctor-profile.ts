"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getCurrentDoctor } from "../libs/current-doctor";
import { prisma } from "../libs/prisma";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Doctor name is required.").max(100),
  lastName: z.string().trim().max(100),
  qualifications: z.string().trim().min(1, "Education / qualifications are required.").max(300),
  specialty: z.string().trim().max(160),
  designation: z.string().trim().max(160),
  bmdcRegistration: z.string().trim().max(80),
  phone: z.string().trim().max(40),
  email: z.union([z.email(), z.literal("")]),
  chamberName: z.string().trim().max(200),
  chamberAddress: z.string().trim().max(500),
  digitalSignature: z.string().trim().max(200),
});

export async function loadDoctorProfile() {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  return { doctor };
}

export async function saveDoctorProfile(input: unknown) {
  const doctor = await getCurrentDoctor();
  if (!doctor) return { error: "Please sign in again." };
  const validation = profileSchema.safeParse(input);
  if (!validation.success) return { error: validation.error.issues[0]?.message ?? "Check the doctor details." };
  const data = validation.data;
  try {
    const saved = await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        ...data,
        lastName: data.lastName || null,
        qualifications: data.qualifications || null,
        specialty: data.specialty || null,
        designation: data.designation || null,
        bmdcRegistration: data.bmdcRegistration || null,
        phone: data.phone || null,
        email: data.email || null,
        chamberName: data.chamberName || null,
        chamberAddress: data.chamberAddress || null,
        digitalSignature: data.digitalSignature || null,
      },
    });
    revalidatePath("/dashboard");
    return { doctor: saved };
  } catch {
    return { error: "Doctor details could not be saved. Check the registration number and try again." };
  }
}
