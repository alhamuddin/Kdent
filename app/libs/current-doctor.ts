import "server-only";
import { requireDashboardAccess } from "./authorization";
import { prisma } from "./prisma";

export async function getCurrentDoctor() {
  const { session, role } = await requireDashboardAccess();

  if (role === "ASSISTANT") {
    return prisma.doctor.findFirst({ orderBy: { firstName: "asc" }, select: {
      id: true, firstName: true, lastName: true, qualifications: true, specialty: true,
      designation: true, bmdcRegistration: true, phone: true, email: true,
      chamberName: true, chamberAddress: true, digitalSignature: true,
    } });
  }

  const [firstName, ...lastNameParts] = session.user.name.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ") || null;

  return prisma.doctor.upsert({
    where: { userId: session.user.id },
    update: {
      // Keep clinician-entered prescription details intact after profile setup.
    },
    create: {
      firstName: firstName || session.user.email,
      lastName,
      email: session.user.email,
      userId: session.user.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      qualifications: true,
      specialty: true,
      designation: true,
      bmdcRegistration: true,
      phone: true,
      email: true,
      chamberName: true,
      chamberAddress: true,
      digitalSignature: true,
    },
  });
}
