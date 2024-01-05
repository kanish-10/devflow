import QuestionForm from "@/components/forms/QuestionForm";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";

const EditPage = async ({ params }: ParamsProps) => {
  const { userId } = auth();
  let mongoUser;
  if (userId) {
    mongoUser = await getUserById({ userId });
  }
  const result = await getQuestionById({ questionId: params.id });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question Page</h1>
      <div className="mt-9">
        <QuestionForm
          type="edit"
          mongoUserId={mongoUser._id}
          questionDetails={JSON.stringify(result)}
        />
      </div>
    </>
  );
};

export default EditPage;
