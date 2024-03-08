"use server";

import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "@/lib/actions/shared.types";
import { connectToDB } from "@/database/mongoose";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    await connectToDB();
    const { question, author, content, path } = params;
    const newAnswer = await Answer.create({
      author,
      content,
      question,
    });
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    await connectToDB();
    const { questionId, sortBy, page = 1, pageSize = 5 } = params;
    const skipAmount = (page - 1) * pageSize;
    let sortOptions = {};
    switch (sortBy) {
      case "highestupvotes":
        sortOptions = { upvotes: -1 };
        break;

      case "lowestupvotes":
        sortOptions = { upvotes: 1 };
        break;

      case "recent":
        sortOptions = { createdAt: -1 };
        break;

      case "old":
        sortOptions = { createdAt: 1 };
        break;
    }
    const answers = await Answer.find({ question: questionId })
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("author", "_id clerkId name picture");
    const totalAnswers = await Answer.countDocuments({ question: questionId });
    const isNext = totalAnswers > answers.length + skipAmount;
    return { answers, isNext };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function upVoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDB();
    const { answerId, path, userId, hasupVoted, hasdownVoted } = params;
    let updateQuery = {};
    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });
    if (!answer) throw new Error("Answer not found");
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function downVoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDB();
    const { answerId, path, userId, hasupVoted, hasdownVoted } = params;
    let updateQuery = {};
    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });
    if (!answer) throw new Error("Answer not found");
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    await connectToDB();
    const { answerId, path } = params;
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error("Answer not found");
    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } },
    );
    await Interaction.deleteMany({ answer: answerId });
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
