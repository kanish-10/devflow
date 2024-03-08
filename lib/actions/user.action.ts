"use server";

import { connectToDB } from "@/database/mongoose";
import User from "@/database/user.model";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "@/lib/actions/shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Answer from "@/database/answer.model";

export async function getUserById(params: GetUserByIdParams) {
  try {
    await connectToDB();
    const { userId } = params;
    return await User.findOne({ clerkId: userId });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function createUser(params: CreateUserParams) {
  try {
    await connectToDB();
    return await User.create(params);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    await connectToDB();
    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    await connectToDB();
    const { clerkId } = params;
    const user = await User.findOne({ clerkId });
    if (!user) {
      throw new Error("User not found");
    }
    // const userQuestionIds = await Question.find({ author: user._id }).distinct(
    //   "_id",
    // );
    await Question.deleteMany({ author: user._id });

    const deletedUser = await User.findByIdAndDelete(user._id);
    return deletedUser;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDB();
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;
    const query: FilterQuery<typeof User> = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};
    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;
    }
    const users = await User.find(query)
      .sort(sortOptions)
      .limit(pageSize)
      .skip(skipAmount);
    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;
    return { users, isNext };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    await connectToDB();
    const { questionId, path, userId } = params;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const isQuestionSaved = user.saved.includes(questionId);
    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true },
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true },
      );
    }
    revalidatePath(path);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionParams) {
  try {
    await connectToDB();
    const { clerkId, searchQuery, filter, page = 1, pageSize = 10 } = params;
    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    const skipAmount = (page - 1) * pageSize;
    let sortOptions = {};
    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;
    }
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: page,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!user) {
      throw new Error("User not found");
    }
    const totalQuestions = await User.countDocuments(query);
    const savedQuestions = user.saved;
    const isNext = totalQuestions > skipAmount + savedQuestions.length;
    return { questions: savedQuestions, isNext };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDB();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("user not found");
    }
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return { user, totalQuestions, totalAnswers };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    await connectToDB();
    const { userId, page = 1, pageSize = 5 } = params;
    const skipAmount = (page - 1) * pageSize;
    const totalQuestions = await Question.countDocuments({ author: userId });
    const userQuestions = await Question.find({ author: userId })
      .sort({
        views: -1,
        upvotes: -1,
      })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    const isNext = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNext };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDB();
    const { userId, page = 1, pageSize = 5 } = params;
    const skipAmount = (page - 1) * pageSize;
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const userAnswer = await Answer.find({ author: userId })
      .sort({
        upvotes: -1,
      })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");
    const isNext = totalAnswers > userAnswer.length + skipAmount;

    return { totalAnswers, answers: userAnswer, isNext };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
