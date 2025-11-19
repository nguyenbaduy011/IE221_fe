import { Metadata } from "next";
import DailyReportsClient from "./DailyReportsClient";

export const metadata: Metadata = {
  title: "Daily Reports Management",
};

export default function Page() {
  return <DailyReportsClient />;
}
