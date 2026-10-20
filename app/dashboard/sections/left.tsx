import { Button } from "@/components/ui/button";
import { Calendar, Inbox as InboxIcon, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { signOut } from "@/app/actions/auth-actions";
import { FaPeopleGroup } from "react-icons/fa6";
import { GoReport } from "react-icons/go";
import { MdDashboard } from "react-icons/md";
import BrandWordmark from "../../components/BrandWordmark";
import type { DashboardRole } from "@/app/libs/authorization";

export type PatientSection =
  "dashboard" | "appointments" | "requests" | "patients" | "reports" | "inbox" | "settings";

export const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: MdDashboard },
  { id: "appointments", label: "Appointment", icon: Calendar },
  { id: "requests", label: "Requests & schedule", icon: Calendar },
  { id: "patients", label: "Patients", icon: FaPeopleGroup },
  { id: "reports", label: "Reports", icon: GoReport },
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function getNavigationItems(role: DashboardRole) {
  return role === "ASSISTANT"
    ? navigationItems.filter((item) => item.id !== "appointments" && item.id !== "inbox")
    : navigationItems;
}

type LeftSidebarProps = {
  role: DashboardRole;
  activeSection: PatientSection;
  onSectionChange: (section: PatientSection) => void;
};

function LeftSidebar({ role, activeSection, onSectionChange }: LeftSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="bg-secondary/60 flex h-[calc(100vh-2.5rem)] min-w-35 flex-col rounded-xl p-3">
      <Link
        className="my-4 flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
        href="/"
      >
        <Image src="/kdent-logo.svg" alt="K-Dent Logo" width={40} height={40} />
        <BrandWordmark compact />
      </Link>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          {getNavigationItems(role).map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;

            return (
              <Button
                key={id}
                variant="link"
                aria-current={isActive ? "page" : undefined}
                className={`w-full justify-start ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-background/70"
                }`}
                onClick={() => onSectionChange(id)}
              >
                <Icon />
                {label}
              </Button>
            );
          })}
        </div>
      </div>
      <Button
        variant="ghost"
        className="text-muted-foreground mt-auto w-full justify-start"
        onClick={handleSignOut}
      >
        <LogOut /> Logout
      </Button>
    </div>
  );
}

export default LeftSidebar;
