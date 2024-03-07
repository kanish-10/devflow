import Link from "next/link";
import Image from "next/image";
import Tag from "@/components/shared/Tag";
import { getHotQuestions } from "@/lib/actions/question.action";
import { getTopPopularTags } from "@/lib/actions/tag.action";

const RightSidebar = async () => {
  const hotQuestions = await getHotQuestions();

  const popularTags = await getTopPopularTags();

  return (
    <section className="background-light900_dark200 light-border custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map((q) => (
            <Link
              className="flex cursor-pointer items-center justify-between gap-7"
              key={q.title}
              href={`/question/${q._id}`}
            >
              <p className="body-medium text-dark500_light700">{q.title}</p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron right"
                className="invert-colors"
                height={20}
                width={20}
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex !flex-col gap-4">
          {popularTags.map((tag: any) => (
            <Tag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.numberOfQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
