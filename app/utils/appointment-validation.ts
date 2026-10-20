import * as z from "zod";

export const visitValidationSchema = z.object({
  appointmentAt: z.iso.datetime("Enter a valid visit date and time."),
  chiefComplaint: z.string().trim().min(1, "Chief complaint is required.").max(1000),
  clinicalNotes: z.string().trim().min(1, "Comment is required.").max(2000),
  patientInstructions: z.string().trim().min(1, "Instructions are required.").max(2000),
  medications: z.array(z.object({
    medicineName: z.string().trim().min(1, "Medicine name is required."),
    dose: z.string().trim().min(1, "Medicine dose is required."),
    frequency: z.string().trim().min(1, "Medicine frequency is required."),
  })),
  investigations: z.array(z.object({
    investigationName: z.string().trim().min(1, "Test name is required."),
  })),
});
