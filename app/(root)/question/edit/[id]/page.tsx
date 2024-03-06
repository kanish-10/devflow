import QuestionForm from "@/components/forms/QuestionForm";
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import { getQuestionById } from "@/lib/actions/question.action";
import { URLProps } from "@/types";

const QuestionEditPage = async ({ params }: URLProps) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const mongoUser = await getUserById({ userId });
  const result = await getQuestionById({ questionId: params.id });
  return (
    <>
      <h2 className="h1-bold text-dark100_light900">Edit Question</h2>
      <div className="mt-9">
        <QuestionForm
          mongoUserId={JSON.stringify(mongoUser._id)}
          type="edit"
          questionDetails={JSON.stringify(result)}
        />
      </div>
    </>
  );
};

export default QuestionEditPage;
