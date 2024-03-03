"use server";

import { connectToDB } from "@/database/mongoose";

export async function createQuestion() {
  try {
    await connectToDB();
  } catch (e) {}
}
