"use server";

import {
  GetAllTagsParams,
  GetQuestionByTagIdParams,
  GetTopInteractedTagsParams,
} from "@/lib/actions/shared.types";
import { connectToDB } from "@/database/mongoose";
import User from "@/database/user.model";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Question from "@/database/question.model";

export async function getTopInteractiveTags(
  params: GetTopInteractedTagsParams,
) {
  try {
    await connectToDB();
    const { userId } = params;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    return [
      { _id: "1", name: "Tag1" },
      { _id: "2", name: "Tag2" },
    ];
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDB();
    const { searchQuery } = params;
    const query: FilterQuery<typeof Tag> = {
      questions: { $exists: true, $ne: [] },
    };
    if (searchQuery) {
      query.$and = [
        { $or: [{ name: { $regex: new RegExp(searchQuery, "i") } }] },
        { questions: { $exists: true, $ne: [] } },
      ];
    }
    const tags = await Tag.find(query);
    return { tags };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getQuestionsByTagId(params: GetQuestionByTagIdParams) {
  try {
    await connectToDB();
    const { tagId, searchQuery } = params;
    const tagFilter: FilterQuery<ITag> = { _id: tagId };
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!tag) throw new Error("Tag not found");

    const questions = tag.questions;
    return { questions, tagTitle: tag.name };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getTopPopularTags() {
  try {
    await connectToDB();
    const popularTags = await Tag.aggregate([
      { $match: { questions: { $exists: true, $ne: [] } } },
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);
    return popularTags;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
