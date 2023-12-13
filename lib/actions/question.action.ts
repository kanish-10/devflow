"use server";

import { connectToDb } from "../mongoose";

export async function createQuestion() {
  try {
    connectToDb();
  } catch (error) {
    console.log(error);
  }
}
