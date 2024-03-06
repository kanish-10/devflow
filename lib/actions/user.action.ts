"use server";

import { connectToDB } from "@/database/mongoose";
import User from "@/database/user.model";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionParams,
  GetUserByIdParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "@/lib/actions/shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { FilterQuery } from "mongoose";

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
    // const { page = 1, pageSize = 20, filter, searchQuery } = params;
    const users = await User.find({}).sort({ createdAt: -1 });
    return { users };
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
    const { clerkId, searchQuery } = params;
    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!user) {
      throw new Error("User not found");
    }
    const savedQuestions = user.saved;
    return { questions: savedQuestions };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
