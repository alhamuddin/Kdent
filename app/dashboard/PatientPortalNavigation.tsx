"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { House, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { signOut } from "@/app/actions/auth-actions";

type PatientPortalNavigationProps = {
  activePage: "dashboard" | "settings";
};

const links = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: House,
  },
  {
    id: "settings",
    label: "Profile & settings",
    href: "/dashboard?section=settings",
    icon: UserRound,
  },
] as const;

export default function PatientPortalNavigation({
  activePage,
}: PatientPortalNavigationProps) {
  const router = useRouter();
  const [isSigningOut, startSigningOut] = useTransition();

  const handleSignOut = () => {
    startSigningOut(async () => {
      await signOut();
      router.push("/login");
    });
  };

  return (
    <nav
      aria-label="Patient navigation"
      className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-secondary/35 p-2"
    >
      {links.map(({ id, label, href, icon: Icon }) => {
        const isActive = activePage === id;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            href={href}
            key={id}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        );
      })}
      <button
        className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        disabled={isSigningOut}
        onClick={handleSignOut}
        type="button"
      >
        <LogOut aria-hidden="true" className="size-4" />
        {isSigningOut ? "Signing out..." : "Log out"}
      </button>
    </nav>
  );
}
