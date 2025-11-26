/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import SubjectEditForm from "./SubjectEditForm";
import SubjectDetailView from "./SubjectDetailView";

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await axiosClient.get(
        `/api/supervisor/subjects/${params.id}/`
      );
      const data = res.data.data || res.data;
      setSubject(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subject details");
      router.push("/supervisor/master-data/subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  const handleUpdateSuccess = () => {
    setIsEditing(false);
    fetchDetail();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center p-10 text-muted-foreground">
        Subject not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="cursor-pointer pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
        </Button>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <SubjectEditForm
          initialData={subject}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
        />
      ) : (
        <SubjectDetailView subject={subject} />
      )}
    </div>
  );
}
