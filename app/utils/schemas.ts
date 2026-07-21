import * as z from "zod";

export const contactSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(3, { message: "Name is required, Min 3 characters" }),
  message: z
    .string()
    .min(10, { message: "Message is required, Min 10 characters" }),
});
