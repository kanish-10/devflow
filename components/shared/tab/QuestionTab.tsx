import QuestionCard from "@/components/cards/QuestionCard";
import { getUserQuestions } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string;
}

const QuestionTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserQuestions({
    userId,
    page: 1,
  });
  return (
    <>
      {result.questions.map((question) => (
        <QuestionCard
          key={question._id}
          _id={question._id}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
          clerkId={clerkId}
          className="mt-5"
        />
      ))}
    </>
  );
};

export default QuestionTab;
