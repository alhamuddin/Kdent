"use client";
import { useForm } from "react-hook-form";
import { registerSchema } from "../utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Buttons from "../components/Button";
import { signUp } from "../actions/auth-actions";
import {
  CheckCircle,
  CircleCheckBig,
  LogIn,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Social from "../components/Social";

function RegisterForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setError("");
    setSuccess("");
    const { email, name, password } = data;
    try {
      const result = await signUp(email, password, name);
      if (result?.error) {
        setError(result.error);
      }
      if (result?.success) {
        setSuccess(result.success);
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      reset();
    }
  };
  return (
    <div>
      <div className="relative container mx-auto mt-20 max-w-2xl gap-12 px-10">
        <h1 className="text-primary my-3 flex items-center justify-center text-3xl font-semibold">
          Don&apos;t have an account?{" "}
        </h1>
        <h2 className="text-primary mb-3 flex items-center justify-center text-xl">
          Sign up to continue
        </h2>
        <div className="glass border-primary/30 animate-fade-in animation-delay-300 rounded-3xl border p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Your name
              </label>
              <input
                {...register("name")}
                id="name"
                disabled={isSubmitting}
                type="name"
                required
                placeholder="Your name"
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
                placeholder="Your email"
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
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <input
                {...register("password")}
                id="password"
                disabled={isSubmitting}
                required
                type="password"

                placeholder="Input your password"
                className="bg-surface border-border focus:border-primary focus:ring-primary w-full resize-none rounded-xl border px-4 py-3 transition-all outline-none focus:ring-1"
              />
              {errors.password && (
                <p className="pt-3 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                disabled={isSubmitting}
                required
                type="password"

                placeholder="Confirm your password"
                className="bg-surface border-border focus:border-primary focus:ring-primary w-full resize-none rounded-xl border px-4 py-3 transition-all outline-none focus:ring-1"
              />
              {errors.confirmPassword && (
                <p className="pt-3 text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Buttons
              className="w-full"
              type="submit"
              size="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Signing up...</>
              ) : !errors ? (
                <>
                  Signed up.
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </>
              ) : (
                <>
                  Sign Up
                  <LogIn className="h-5 w-5" />
                </>
              )}
            </Buttons>
          </form>
          <div className="mt-3">
            {error && (
              <p className="flex items-center gap-3 text-red-500">
                <TriangleAlert /> {error}
              </p>
            )}
            {success && (
              <p className="flex items-center gap-3 text-green-500">
                {" "}
                <CircleCheckBig />
                {success}
              </p>
            )}
          </div>
          <div className="mt-3">
            <Link
              className="text-primary/80 text-sm hover:text-white/50"
              href="/login"
            >
              Already have an account? click here!{" "}
            </Link>
          </div>
        </div>
        <Social />
      </div>
    </div>
  );
}

export default RegisterForm;
