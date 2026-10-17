"use client";

import { useForm } from "react-hook-form";
import { contactSchema } from "../utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../components/Button";
import { Turnstile } from "@marsidev/react-turnstile";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { sendContactMessage } from "../actions/contact-form";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "kdenthc@gmail.com",
    href: "mailto:kdenthc@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "01978-128274, 01812-827414",
    href: "tel:+8801978128274",
  },
  {
    icon: MapPin,
    label: "Location",
    value:
      "Arafat Tower, 2nd floor (Beside CareMax Hospital), Chowdhury Hat, Chittagong",
    href: "https://maps.app.goo.gl/cerjVeKXCiqtc5na9",
  },
];

function ContactForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    if (!turnstileToken) {
      setServerError("Please complete the verification.");
      return;
    }

    setServerError("");
    setSuccessMessage("");

    try {
      const result = await sendContactMessage(data, turnstileToken);

      if (result.error) {
        setServerError(result.error);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      setSuccessMessage(result.success ?? "Your message has been sent.");
      reset();
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } catch {
      setServerError("Your message could not be sent. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");
    setSuccessMessage("");
    void handleSubmit(onSubmit)(event);
  };

  return (
    <div>
      <div className="relative container mx-auto grid max-w-5xl gap-6 px-0 sm:gap-12 sm:px-6 lg:grid-cols-2">
        <div className="glass border-primary/30 animate-fade-in animation-delay-300 rounded-3xl border p-8">
          <form className="space-y-6" noValidate onSubmit={submitForm}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Name
              </label>
              <input
                {...register("name")}
                id="name"
                disabled={isSubmitting}
                type="text"
                required
                placeholder="Your name..."
                className="bg-surface border-border focus:border-primary focus:ring-primary w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-1"
              />
              {errors.name && (
                <p className="pt-3 text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Your Email
              </label>
              <input
                {...register("email")}
                id="email"
                disabled={isSubmitting}
                type="email"
                required
                placeholder="Your email..."
                className="bg-surface border-border focus:border-primary focus:ring-primary w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-1"
              />
              {errors.email && (
                <p className="pt-3 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium"
              >
                Your message...
              </label>
              <textarea
                {...register("message")}
                id="message"
                disabled={isSubmitting}
                required

                placeholder="Write your message..."
                className="bg-surface border-border focus:border-primary focus:ring-primary w-full resize-none rounded-xl border px-4 py-3 transition-all outline-none focus:ring-1"
              />
              {errors.message && (
                <p className="pt-3 text-sm text-red-400">
                  {errors.message.message}
                </p>
              )}
            </div>
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setServerError("Bot verification could not be completed. Please refresh the challenge.")}
            />
            {serverError && (
              <p className="flex items-center gap-2 text-sm text-rose-300" role="alert">
                <AlertCircle className="size-4 shrink-0" />
                {serverError}
              </p>
            )}
            {successMessage && (
              <p className="flex items-center gap-2 text-sm text-emerald-300" role="status">
                <CheckCircle className="size-4 shrink-0" />
                {successMessage}
              </p>
            )}
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : successMessage ? (
                <>
                  Message Sent Successfully
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </>
              ) : (
                <>
                  Send Message
                  <Send className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div>
          {/* Contact Info */}
          <div className="animate-fade-in animation-delay-400 space-y-6">
            <div className="glass rounded-3xl p-8">
              <h3 className="mb-6 text-xl font-semibold">
                Contact Information
              </h3>
              <div className="space-y-4">
                {contactInfo.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    className="hover:bg-surface group flex items-center gap-4 rounded-xl p-4 transition-colors"
                  >
                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                      <item.icon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        {item.label}
                      </div>
                      <div className="font-medium">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability Card */}
            <div className="glass border-primary/30 rounded-3xl border p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                <span className="font-medium">Currently Available</span>
              </div>
              <p className="text-muted-foreground text-sm">
                We are currently open for 6 days in a week except Friday.
                Paitent visit time 10am to 2pm and 5pm to 9pm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
