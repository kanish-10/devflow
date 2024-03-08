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
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: FilterQuery<typeof Tag> = {
      questions: { $exists: true, $ne: [] },
    };
    if (searchQuery) {
      query.$and = [
        { $or: [{ name: { $regex: new RegExp(searchQuery, "i") } }] },
        { questions: { $exists: true, $ne: [] } },
      ];
    }
    const skipAmount = (page - 1) * pageSize;
    let sortOptions = {};
    switch (filter) {
      case "popular":
        sortOptions = { questions: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
    }
    const tags = await Tag.find(query)
      .sort(sortOptions)
      .limit(pageSize)
      .skip(skipAmount);
    const totalTags = await Tag.countDocuments(query);
    const isNext = totalTags > skipAmount + tags.length;
    return { tags, isNext };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getQuestionsByTagId(params: GetQuestionByTagIdParams) {
  try {
    await connectToDB();
    const { tagId, searchQuery, page = 1, pageSize = 10 } = params;
    const tagFilter: FilterQuery<ITag> = { _id: tagId };
    const skipAmount = (page - 1) * pageSize;
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!tag) throw new Error("Tag not found");
    const totalTags = await Tag.countDocuments(tagFilter);

    const questions = tag.questions;
    const isNext = totalTags > skipAmount + questions;

    return { questions, tagTitle: tag.name, isNext };
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
