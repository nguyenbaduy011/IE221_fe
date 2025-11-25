import { Metadata } from "next";
import SubjectDetailClient from "../SubjectDetailClient";

export const metadata: Metadata = {
  title: "Chi tiết môn học | LMS Trainee",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { id } = await params; 
  const subjectId = Number(id);

  return <SubjectDetailClient initialId={subjectId} />;
}
