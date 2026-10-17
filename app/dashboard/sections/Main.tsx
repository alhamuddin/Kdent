import React from "react";
import { PatientSection } from "./left";
import PatientDashboard from "../content/Dashboard";
import AllPatients from "../content/allPatients";
import AccountSettings, {
  type AccountSettingsProps,
} from "../content/AccountSettings";

function Main({
  activeSection,
  accountSettings,
}: {
  activeSection: PatientSection;
  accountSettings: AccountSettingsProps;
}) {
  return (
    <>
      <div
        className={`w-full min-w-0 rounded-xl p-1 sm:p-2 lg:p-6 ${
          activeSection === "settings"
            ? "h-[calc(100dvh-6rem)] min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:h-[calc(100dvh-2.5rem)]"
            : ""
        }`}
      >
        {activeSection === "dashboard" && (
          <div>
            <PatientDashboard />
          </div>
        )}
        {activeSection === "appointments" && <div>Appointments Content</div>}
        {activeSection === "patients" && (
          <div className="h-auto min-h-0 overflow-visible lg:h-[calc(100dvh-8rem)] lg:min-h-[32rem] lg:overflow-hidden">
            <AllPatients />
          </div>
        )}
        {activeSection === "reports" && <div>Reports Content</div>}
        {activeSection === "settings" && (
          <AccountSettings {...accountSettings} />
        )}
      </div>
    </>
  );
}

export default Main;
