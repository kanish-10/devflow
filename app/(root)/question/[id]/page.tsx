import { getQuestionById } from "@/lib/actions/question.action";
import Link from "next/link";
import Image from "next/image";
import Metric from "@/components/shared/Metric";
import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import ParseHTML from "@/components/shared/ParseHTML";
import Tag from "@/components/shared/Tag";
import AnswerForm from "@/components/forms/AnswerForm";
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.action";
import AllAnswers from "@/components/shared/AllAnswers";

const QuestionDetailPage = async ({ params }: { params: { id: string } }) => {
  const question = await getQuestionById({ questionId: params.id });
  const { userId: clerkId } = auth();
  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  }
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${question.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={question.author.picture}
              alt="Profile picture"
              width={22}
              height={22}
              className="rounded-full"
            />
            <p className="paragraph-semibold text-dark300_light700">
              {question.author.name}
            </p>
          </Link>
          <div className="flex justify-end">VOTING</div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {question.title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimestamp(question.createdAt)}`}
          title=" Asked "
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="Messages"
          value={question.answers.length}
          title=" Answers "
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={formatAndDivideNumber(question.views)}
          title=" Views "
          textStyles="small-medium text-dark400_light800"
        />
      </div>
      <ParseHTML data={question.content} />
      <div className="mt-8 flex flex-wrap gap-2">
        {question.tags.length > 0 &&
          question.tags.map((tag: any) => (
            <Tag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              showCount={false}
            />
          ))}
      </div>

      {question.answers.length > 0 && (
        <AllAnswers
          questionId={question._id}
          userId={JSON.stringify(mongoUser._id)}
          totalAnswers={question.answers.length}
        />
      )}

      <AnswerForm
        question={question.content}
        questionId={JSON.stringify(question._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  );
};

export default QuestionDetailPage;
