import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; 

type Props = {
  studentName: string;
  courseName: string;
  courseStart: string;
  courseEnd: string;
  courseStatus: number;
};

const statusConfig: {
  [key: number]: {
    label: string;
    className: string;
  };
} = {
  0: {
    label: "Not started",
    // Xám
    className:
      "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
  },
  1: {
    label: "In Progress",
    // Xanh dương
    className:
      "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  2: {
    label: "Finished",
    // Xanh lá
    className:
      "border-green-200 bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
};

// Fallback mặc định
const defaultStatusConfig = {
  label: "Unknown",
  className: "border-transparent bg-gray-100 text-gray-500",
};

export default function StudentInfo({
  studentName,
  courseName,
  courseStart,
  courseEnd,
  courseStatus,
}: Props) {
  // Lấy config dựa trên status, nếu không có thì dùng default
  const statusInfo = statusConfig[courseStatus] || defaultStatusConfig;

  // Hàm format ngày an toàn
  const formatDateSafe = (dateStr: string) => {
    try {
      if (!dateStr) return "--/--/----";
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-500">
      <Avatar className="w-20 h-20 border-2 border-border">
        <AvatarImage src="" alt={studentName} />
        <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">
          {studentName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-2 text-center md:text-left flex-1">
        <h2 className="text-2xl font-bold tracking-wide">{studentName}</h2>

        <div className="text-sm text-muted-foreground">
          {formatDateSafe(courseStart)} - {formatDateSafe(courseEnd)}
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Course detail:</span>

          {/* Thay text-blue-600 bằng text-primary để theo theme */}
          <span className="text-primary font-bold mr-2">{courseName}</span>

          <Badge
            variant="outline"
            className={cn("whitespace-nowrap", statusInfo.className)}
          >
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
