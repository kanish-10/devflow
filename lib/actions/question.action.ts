"use server";

import { connectToDB } from "@/database/mongoose";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "@/lib/actions/shared.types";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { redirect } from "next/navigation";
import { FilterQuery } from "mongoose";

export async function createQuestion(params: CreateQuestionParams) {
  try {
    await connectToDB();
    const { title, content, tags, author, path } = params;
    const question = await Question.create({
      title,
      content,
      author,
    });
    const tagDocuments = [];
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true },
      );
      tagDocuments.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDB();
    const { searchQuery, filter } = params;
    const query: FilterQuery<typeof Question> = {};
    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
    let sortOptions = {};
    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
    }
    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort(sortOptions);
    return { questions };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    await connectToDB();
    const { questionId } = params;
    const question = await Question.findById(questionId)
      .populate({
        path: "tags",
        model: Tag,
        select: "_id name",
      })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function upVoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDB();
    const { questionId, path, userId, hasupVoted, hasdownVoted } = params;
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
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) throw new Error("Question not found");
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function downVoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDB();
    const { questionId, path, userId, hasupVoted, hasdownVoted } = params;
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
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) throw new Error("Question not found");
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    await connectToDB();
    const { questionId, path, isQuestionPath } = params;
    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } },
    );
    if (isQuestionPath) {
      redirect("/");
      return;
    }
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    await connectToDB();
    const { questionId, content, path, title } = params;
    const question = await Question.findById(questionId).populate("tags");
    if (!question) throw new Error("Question not found");
    question.title = title;
    question.content = content;
    await question.save();
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getHotQuestions() {
  try {
    await connectToDB();
    const hotQuestions = await Question.find({})
      .sort({
        views: -1,
        upvotes: -1,
      })
      .limit(5);
    return hotQuestions;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
