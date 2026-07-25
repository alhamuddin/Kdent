"use client";
import { useForm } from "react-hook-form";
import { loginSchema } from "../utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Buttons from "../components/Button";
import { signIn } from "../actions/auth-actions";
import {
  CheckCircle,
  CircleCheckBig,
  LogIn,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
//import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Social from "../components/Social";

function LoginForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const {
    register,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError("");
    setSuccess("");
    try {
      const result = await signIn(data.email, data.password);
      if (result?.error) {
        setError(result.error);
      }
      if (result?.success) {
        setSuccess(result.success);
        router.push("/dashboard"); // 1. Navigate to the new page first.
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
          Welcome Back{" "}
        </h1>
        <h2 className="text-primary mb-3 flex items-center justify-center text-xl">
          Sign in to your account to continue
        </h2>
        <div className="glass border-primary/30 animate-fade-in animation-delay-300 rounded-3xl border p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                Your password
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
            <Buttons
              className="w-full"
              type="submit"
              size="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Logging in...</>
              ) : !errors ? (
                <>
                  Logged in.
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </>
              ) : (
                <>
                  Login
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
              href="/register"
            >
              Don&apos;t have an account? click here!{" "}
            </Link>
          </div>
        </div>
        {/* Social Authentication */}
        <Social />
      </div>
    </div>
  );
}

export default LoginForm;
