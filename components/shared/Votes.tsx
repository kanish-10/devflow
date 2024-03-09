"use client";

import Image from "next/image";
import { getFormattedNumber } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import {
  downVoteQuestion,
  upVoteQuestion,
} from "@/lib/actions/question.action";
import { downVoteAnswer, upVoteAnswer } from "@/lib/actions/answer.action";
import { toggleSaveQuestion } from "@/lib/actions/user.action";
import { useEffect } from "react";
import { viewQuestion } from "@/lib/actions/interaction.action";
import { toast } from "@/components/ui/use-toast";

interface VotesProps {
  type: "question" | "answer";
  itemId: string;
  userId: string;
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  downvotes,
  hasUpvoted,
  hasSaved,
  hasDownvoted,
}: VotesProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const handleSave = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    await toggleSaveQuestion({
      userId: JSON.parse(userId),
      path: pathname,
      questionId: JSON.parse(itemId),
    });

    return toast({
      title: `Question ${!hasSaved ? "Saved in" : "Removed from your collection"}`,
      variant: !hasSaved ? "default" : "destructive",
    });
  };

  useEffect(() => {
    viewQuestion({
      questionId: JSON.parse(itemId),
      userId: userId ? JSON.parse(userId) : undefined,
    });
  }, [itemId, userId, pathname, router]);

  const handleVote = async (action: "upvote" | "downvote") => {
    if (!userId) {
      return toast({
        title: "Please log in",
        description: "You must be logged in to perform this action",
      });
    }

    if (action === "upvote") {
      if (type === "question") {
        await upVoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasdownVoted: hasDownvoted,
          hasupVoted: hasUpvoted,
          path: pathname,
        });
      } else {
        await upVoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasdownVoted: hasDownvoted,
          hasupVoted: hasUpvoted,
          path: pathname,
        });
      }
      return toast({
        title: `Upvote ${!hasUpvoted ? "Successful" : "Removed"}`,
        variant: !hasUpvoted ? "default" : "destructive",
      });
    } else {
      if (type === "question") {
        await downVoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasdownVoted: hasDownvoted,
          hasupVoted: hasUpvoted,
          path: pathname,
        });
      } else {
        await downVoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasdownVoted: hasDownvoted,
          hasupVoted: hasUpvoted,
          path: pathname,
        });
      }
      return toast({
        title: `Down vote ${!hasDownvoted ? "Successful" : "Removed"}`,
        variant: !hasDownvoted ? "default" : "destructive",
      });
    }
  };

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasUpvoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            alt="upvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {getFormattedNumber(upvotes)}
            </p>
          </div>
        </div>
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasDownvoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            alt="downvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {getFormattedNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {type === "question" && (
        <Image
          src={
            hasSaved
              ? "/assets/icons/star-filled.svg"
              : "/assets/icons/star-red.svg"
          }
          alt="star"
          width={18}
          height={18}
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
