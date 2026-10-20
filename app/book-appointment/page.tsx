import Link from "next/link";
import { headers } from "next/headers";
import { Home } from "lucide-react";
import { auth } from "@/auth";
import { getPublicAppointmentOptions } from "@/app/actions/appointment-portal";
import { buttonVariants } from "@/components/ui/button";
import BookingForm from "./booking-form";

export default async function BookAppointmentPage() {
  const [session, options] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getPublicAppointmentOptions(),
  ]);

  return (
    <main className="bg-background min-h-screen px-4 py-12 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          className={buttonVariants({ size: "sm", variant: "outline" })}
          href="/"
        >
          <Home aria-hidden="true" />
          Home
        </Link>
        <p className="text-primary mt-8 text-xs font-semibold tracking-[.18em] uppercase">
          K-Dent clinic
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Book an appointment</h1>
        <p className="mt-2 text-sm text-white/60">
          Choose a published clinic time. Your appointment is confirmed after
          the doctor accepts your request.
        </p>
        <BookingForm
          doctors={options.doctors}
          email={session?.user.email ?? ""}
          loggedIn={Boolean(session?.user)}
          name={session?.user.name ?? ""}
        />
      </div>
    </main>
  );
}
