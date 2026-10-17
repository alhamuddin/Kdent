"use client";

import { useState } from "react";
import LeftSidebar, {
  navigationItems,
  type PatientSection,
} from "./sections/left";
import Main from "./sections/Main";
import RightSidebar from "./sections/right";
import type { AccountSettingsProps } from "./content/AccountSettings";

export default function PatientWorkspace({
  accountSettings,
}: {
  accountSettings: AccountSettingsProps;
}) {
  const [activeSection, setActiveSection] =
    useState<PatientSection>("dashboard");

  return (
    <div
      className={`grid h-auto min-h-full w-full gap-3 lg:h-full ${
        activeSection === "patients"
          ? "lg:grid-cols-[15%_84%] lg:gap-x-[1%]"
          : "lg:grid-cols-[15%_58%_25%] lg:gap-x-[1%]"
      }`}
    >
      <nav
        aria-label="Patient sections"
        className="bg-secondary/60 col-span-full flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-xl p-1.5 [-ms-overflow-style:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            aria-current={activeSection === id ? "page" : undefined}
            className={`flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
              activeSection === id
                ? "bg-primary text-primary-foreground"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
            key={id}
            onClick={() => setActiveSection(id)}
            type="button"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="hidden lg:block">
        <LeftSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>
      <Main activeSection={activeSection} accountSettings={accountSettings} />
      {activeSection !== "patients" && (
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
