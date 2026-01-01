import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const QuizCard = ({ quiz }) => {
  const meta = quiz.quiz_data && quiz.quiz_data.meta ? quiz.quiz_data.meta : {};

  return (
    <Card className="shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-slate-50">
          {meta.topic || quiz.filename}
        </CardTitle>
        <CardDescription className="text-[11px] text-slate-400">
          Source: {quiz.filename}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4 text-xs text-slate-300">
        <div className="space-y-1">
          <p>Questions: {meta.total_questions || "N/A"}</p>
          <p>Created at: {new Date(quiz.created_at).toLocaleDateString()}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-300">
          Ready to sync
        </span>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
