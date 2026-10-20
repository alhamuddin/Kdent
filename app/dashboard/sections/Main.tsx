import React from "react";
import { PatientSection } from "./left";
import PatientDashboard from "../content/Dashboard";
import AllPatients from "../content/allPatients";
import AppointmentWorkspace from "../content/AppointmentWorkspace";
import AccountSettings, {
  type AccountSettingsProps,
} from "../content/AccountSettings";
import Reports from "../content/Reports";
import Inbox from "../content/Inbox";
import AppointmentManagement from "../content/AppointmentManagement";
import type { DashboardPatient, DashboardVisit } from "../dashboard-data";
import UserGreeting from "../UserGreeting";

function Main({
  activeSection,
  accountSettings,
  dashboardData,
}: {
  activeSection: PatientSection;
  accountSettings: AccountSettingsProps;
  dashboardData: { patients: DashboardPatient[]; visits: DashboardVisit[] };
}) {
  return (
    <>
      <div className="h-auto min-h-0 w-full min-w-0 overflow-y-visible rounded-xl p-1 sm:p-2 lg:h-[calc(100dvh-2.5rem)] lg:overflow-y-auto lg:p-6">
        <UserGreeting name={accountSettings.user.name} role={accountSettings.role} />
        {activeSection === "dashboard" && (
          <div>
            <PatientDashboard patients={dashboardData.patients} visits={dashboardData.visits} />
          </div>
        )}
        {activeSection === "appointments" && <AppointmentWorkspace />}
        {activeSection === "requests" && <AppointmentManagement role={accountSettings.role as "DOCTOR" | "ASSISTANT" | "ADMIN"} />}
        {activeSection === "patients" && (
          <div className="h-auto min-h-0 overflow-visible lg:h-[calc(100dvh-8rem)] lg:min-h-[32rem] lg:overflow-hidden">
            <AllPatients patients={dashboardData.patients} />
          </div>
        )}
        {activeSection === "reports" && <Reports patients={dashboardData.patients} visits={dashboardData.visits} />}
        {activeSection === "inbox" && <Inbox />}
        {activeSection === "settings" && (
          <AccountSettings {...accountSettings} />
        )}
      </div>
    </>
  );
}

export default Main;
