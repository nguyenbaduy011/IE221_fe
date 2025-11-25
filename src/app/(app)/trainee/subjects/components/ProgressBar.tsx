import { Progress } from "@/components/ui/progress";

type Props = {
  subjectName: string;
  percent: number;
};

export default function ProgressBar({ subjectName, percent }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-3">
      <div className="flex justify-between items-end">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Learning <span className="text-blue-600">{subjectName}</span> progress
        </h3>
        <span className="text-sm font-bold text-blue-600">{percent}%</span>
      </div>
      <Progress value={percent} className="h-3 w-full" />
    </div>
  );
}
