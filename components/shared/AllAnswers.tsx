import Filter from "@/components/shared/Filter";
import { AnswerFilters } from "@/constants/filters";
import { getAnswers } from "@/lib/actions/answer.action";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "@/components/shared/ParseHTML";
import Votes from "@/components/shared/Votes";
import Pagination from "@/components/shared/Pagination";

interface AllAnswersProps {
  questionId: string;
  userId: string;
  totalAnswers: number;
  filter?: string;
  page?: number | string;
}

const AllAnswers = async ({
  questionId,
  totalAnswers,
  userId,
  filter,
  page,
}: AllAnswersProps) => {
  const result = await getAnswers({
    questionId: JSON.parse(questionId),
    page: page ? +page : 1,
    sortBy: filter,
  });
  console.log(filter);
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div className="">
        {result.answers.map((answer) => (
          <article key={answer._id} className="light-border border-b py-10">
            <div className="flex items-center justify-between">
              <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    alt="profile picture"
                    className="rounded-full object-cover max-sm:mt-0.5"
                    width={18}
                    height={18}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700">
                      {answer.author.name}
                    </p>
                    <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                      <span className="max-sm:hidden"> - </span>
                      answered {getTimestamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  <Votes
                    type="answer"
                    upvotes={answer.upvotes.length}
                    downvotes={answer.downvotes.length}
                    hasDownvoted={
                      userId ? answer.downvotes.includes(userId) : false
                    }
                    hasUpvoted={
                      userId ? answer.upvotes.includes(userId) : false
                    }
                    itemId={JSON.stringify(answer._id)}
                    userId={JSON.stringify(userId)}
                  />
                </div>
              </div>
            </div>
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
      <div className="mt-10 w-full">
        <Pagination pageNumber={page ? +page : 1} isNext={result.isNext} />
      </div>
    </div>
  );
};

export default AllAnswers;
