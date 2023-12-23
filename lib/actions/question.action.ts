"use server";

import Tag from "@/database/tag.model";
import { connectToDb } from "../mongoose";
import Question from "@/database/question.model";

export async function createQuestion(params: any) {
  try {
    connectToDb();

    const { title, content, tags, author } = params;

    // Create question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocument = [];

    // Create the tags or get them if they already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      );

      tagDocument.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocument } },
    });

    // Create an interaction record for the users ask-question action

    // Increment the author's reputation by +5 for creating a question
  } catch (error) {
    console.log(error);
  }
}
