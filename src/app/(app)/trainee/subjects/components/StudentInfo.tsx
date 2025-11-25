import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Props = {
  studentName: string;
  courseName: string;
  courseStart: string;
  courseEnd: string;
  courseStatus: number;
};

export default function StudentInfo({ studentName, courseName, courseStart, courseEnd, courseStatus }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-6">
      <Avatar className="w-20 h-20">
        <AvatarImage src="" alt={studentName} />
        <AvatarFallback className="text-xl font-bold">{studentName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          {studentName}
        </h2>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(courseStart), "dd/MM/yyyy")} - {format(new Date(courseEnd), "dd/MM/yyyy")}
        </div>

        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Course detail:</span>
          <span className="text-blue-600 font-bold">{courseName}</span>
          <Badge variant={courseStatus === 2 ? "default" : "secondary"}>
             {/* Map status number to text logic here if needed */}
             Status: {courseStatus}
          </Badge>
        </div>
      </div>
    </div>
  );
}
