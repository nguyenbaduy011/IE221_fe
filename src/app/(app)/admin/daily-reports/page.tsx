import { Metadata } from "next";
import AdminDailyReportsClient from "./AdminDailyReportsClient";

export const metadata: Metadata = {
  title: "Trainee Reports Management",
  description: "Monitor daily reports from your trainees",
};

export default function AdminDailyReportsPage() {
  return <AdminDailyReportsClient />;
}
