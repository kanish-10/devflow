"use server";

import {
  CreateAnswerParams,
  GetAnswersParams,
} from "@/lib/actions/shared.types";
import { connectToDB } from "@/database/mongoose";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";

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
    const { questionId } = params;
    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .sort({ createdAt: -1 });
    return { answers };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
