import { Metadata } from "next";
import SupervisorDailyReportsClient from "./SupervisorDailyReportsClient";

export const metadata: Metadata = {
  title: "Trainee Reports Management",
  description: "Monitor daily reports from your trainees",
};

export default function SupervisorDailyReportsPage() {
  return <SupervisorDailyReportsClient />;
}
