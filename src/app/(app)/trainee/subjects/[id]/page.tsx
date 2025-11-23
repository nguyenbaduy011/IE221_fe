import { Metadata } from "next";
import SubjectDetailClient from "../SubjectDetailClient";

export const metadata: Metadata = {
  title: "Chi tiết môn học | LMS Trainee",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { id } = await params;        // 🔥 Next.js 15.5+ bắt buộc phải await
  const subjectId = Number(id);

  return <SubjectDetailClient initialId={subjectId} />;
}
