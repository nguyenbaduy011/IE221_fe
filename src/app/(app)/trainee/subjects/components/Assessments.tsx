import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types/subject";
import { format } from "date-fns";

type Props = {
  score: number | null;
  maxScore: number;
  comments: Comment[];
};

export default function Assessments({ score, maxScore, comments }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-4">
      <h3 className="text-lg font-bold border-b pb-2 dark:border-gray-700">Assessments</h3>

      {/* Score */}
      <div className="text-base font-medium">
        Score: <span className="text-blue-600 font-bold text-lg">{score ?? "--"}</span>
        <span className="text-gray-400"> / {maxScore}</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 && <p className="text-gray-500 italic text-sm">No comments yet.</p>}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src="" />
              <AvatarFallback>{comment.user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {comment.user.full_name}
                </p>
                <span className="text-xs text-gray-400">
                    {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm:ss")}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
