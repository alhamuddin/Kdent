"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AuthShell from "../components/AuthShell";
import Social from "../components/Social";
import { signIn } from "../actions/auth-actions";
import { loginSchema } from "../utils/schemas";

export default function LoginForm() {
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setServerError("");
    try {
      const result = await signIn(data.email, data.password);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("We couldn’t sign you in. Please try again.");
    }
  };

  return (
    <AuthShell
      description="Use your K-Dent account to continue to your workspace."
      eyebrow="Welcome back"
      title="Sign in to K-Dent"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            disabled={isSubmitting}
            id="email"
            placeholder="name@clinic.com"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="password"
          >
            Password
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            disabled={isSubmitting}
            id="password"
            placeholder="Enter your password"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-2 text-xs text-rose-300">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p
            aria-live="polite"
            className="flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200"
            role="alert"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {serverError}
          </p>
        )}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Signing in
            </>
          ) : (
            <>
              Sign in <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase">
        <span className="h-px flex-1 bg-white/10" />
        or continue with
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <Social />

      <p className="mt-7 text-center text-sm text-white/55">
        New to K-Dent?{" "}
        <Link
          className="font-semibold text-primary transition hover:text-white"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
