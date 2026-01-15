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
        <CardTitle className="text-base theme-text">
          {meta.topic || quiz.filename}
        </CardTitle>
        <CardDescription className="text-[11px] theme-muted">
          Source: {quiz.filename}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4 text-xs theme-muted">
        <div className="space-y-1">
          <p>Questions: {meta.total_questions || "N/A"}</p>
          <p>Created at: {new Date(quiz.created_at).toLocaleDateString()}</p>
        </div>
        <span className="game-chip inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium">
          Ready to sync
        </span>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
