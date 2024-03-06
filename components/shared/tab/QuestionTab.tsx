import { SearchParamsProps } from "@/types";
import { getUserQuestions } from "@/lib/actions/user.action";
import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";

interface QuestionTabProps extends SearchParamsProps {
  userId: string;
  clerkId: string | null;
}

const QuestionTab = async ({
  searchParams,
  userId,
  clerkId,
}: QuestionTabProps) => {
  const result = await getUserQuestions({ userId, page: 1 });
  return (
    <>
      {result.questions.length > 0 ? (
        result.questions.map((question) => (
          <QuestionCard
            key={question._id}
            _id={question._id}
            author={question.author}
            title={question.title}
            upvotes={question.upvotes}
            answers={question.answers}
            tags={question.tags}
            views={question.views}
            createdAt={question.createdAt}
            clerkId={clerkId}
          />
        ))
      ) : (
        <NoResult
          title="There's no question to show"
          description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. Our query could be the next big thing others learn from. Get involved! 💡"
          link="/ask-question"
          linkTitle="Ask a question"
        />
      )}
    </>
  );
};

export default QuestionTab;
