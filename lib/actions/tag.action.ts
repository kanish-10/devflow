"use server";

import {
  GetAllTagsParams,
  GetTopInteractedTagsParams,
} from "@/lib/actions/shared.types";
import { connectToDB } from "@/database/mongoose";
import User from "@/database/user.model";
import Tag from "@/database/tag.model";

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
    const tags = await Tag.find({});
    return { tags };
  } catch (e) {
    console.log(e);
    throw e;
  }
}
