import { getQuestionById } from "@/lib/actions/question.action";
import Link from "next/link";
import Image from "next/image";
import Metric from "@/components/shared/Metric";
import { getFormattedNumber, getTimestamp } from "@/lib/utils";
import ParseHTML from "@/components/shared/ParseHTML";
import Tag from "@/components/shared/Tag";
import AnswerForm from "@/components/forms/AnswerForm";
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.action";
import AllAnswers from "@/components/shared/AllAnswers";
import Votes from "@/components/shared/Votes";

const QuestionIdPage = async ({ params }: { params: { id: string } }) => {
  const { userId: clerkId } = auth();
  const result = await getQuestionById({ questionId: params.id });
  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  } else {
    mongoUser = "";
  }

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${result.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={result.author.picture}
              alt="Profile picture"
              className="rounded-full"
              width={22}
              height={22}
            />
            <p className="paragraph-semibold text-dark300_light700">
              {result.author.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Votes
              type="question"
              itemId={JSON.stringify(result._id)}
              userId={JSON.stringify(mongoUser._id)}
              upvotes={result.upvotes.length}
              hasUpvoted={
                mongoUser ? result.upvotes.includes(mongoUser._id) : false
              }
              downvotes={result.downvotes.length}
              hasDownvoted={
                mongoUser ? result.downvotes.includes(mongoUser._id) : false
              }
              hasSaved={
                mongoUser ? mongoUser?.saved.includes(result._id) : false
              }
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {result.title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimestamp(result.createdAt)}`}
          title=" Asked"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          value={getFormattedNumber(result.answers.length)}
          title=" Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={getFormattedNumber(result.views)}
          title=" Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>
      <ParseHTML data={result.content} />
      <div className="mt-8 flex flex-wrap gap-2">
        {result.tags.map((tag: any) => (
          <Tag key={tag.name} name={tag.name} _id={tag._id} showCount={false} />
        ))}
      </div>
      <AllAnswers
        questionId={JSON.stringify(result._id)}
        userId={mongoUser._id}
        totalAnswers={result.answers.length}
      />
      <AnswerForm
        questionId={JSON.stringify(result._id)}
        authorId={JSON.stringify(mongoUser._id)}
        question={result.content}
      />
    </>
  );
};

export default QuestionIdPage;
