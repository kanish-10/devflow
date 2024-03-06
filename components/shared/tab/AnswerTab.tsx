import { SearchParamsProps } from "@/types";
import { getUserAnswers } from "@/lib/actions/user.action";
import AnswerCard from "@/components/cards/AnswerCard";
import NoResult from "@/components/shared/NoResult";

interface AnswerTabProps extends SearchParamsProps {
  userId: string;
  clerkId: string | null;
}

const AnswerTab = async ({ searchParams, clerkId, userId }: AnswerTabProps) => {
  const result = await getUserAnswers({ userId, page: 1 });

  return (
    <>
      <div>
        {result.answers.length > 0 ? (
          result.answers.map((answer) => (
            <AnswerCard
              key={answer._id}
              clerkId={clerkId}
              _id={answer._id}
              question={answer.question}
              author={answer.author}
              upvotes={answer.upvotes.length}
              createdAt={answer.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no answer to show"
            description="Be the first to break the silence! 🚀 Answer a Question and kickstart the discussion. Our answer could be the next big solution others learn from. Get involved! 💡"
          />
        )}
      </div>
    </>
  );
};

export default AnswerTab;
