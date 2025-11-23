// src/app/(app)/trainee/subjects/[id]/page.tsx
import SubjectDetailClient from "./SubjectDetailClient";

// Định nghĩa kiểu cho props của Page
interface PageProps {
  params: { id: string };
}

export const metadata = {
  title: "Chi tiết môn học | LMS Trainee",
};

// Next.js tự động truyền 'params' vào component Page
export default function SubjectDetailPage({ params }: PageProps) {
  // Convert id sang number và truyền xuống Client
  return <SubjectDetailClient initialId={Number(params.id)} />;
}