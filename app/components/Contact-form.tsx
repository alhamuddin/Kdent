"use client";

import React, { useState, useTransition } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { contactSchema } from "../utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../components/Button";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { sendMail } from "../actions/sendMail";

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
  const {
    register,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    sendMail(data);
    console.log(data);
    reset();
  };

  return (
    <div>
      <div className="relative container mx-auto grid max-w-5xl gap-12 px-10 lg:grid-cols-2">
        <div className="glass border-primary/30 animate-fade-in animation-delay-300 rounded-3xl border p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
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
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : isSubmitSuccessful ? (
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
