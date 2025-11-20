import { Metadata } from "next";
import NewDailyReportClient from "./NewDailyReportClient";

export const metadata: Metadata = {
  title: "Create New Daily Report",
  description: "Submit your daily learning progress",
};

export default function NewDailyReportPage() {
  return <NewDailyReportClient />;
}
