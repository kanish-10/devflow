import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import { URLProps } from "@/types";
import ProfileForm from "@/components/forms/ProfileForm";

const EditProfilePage = async ({ params }: URLProps) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const mongoUser = await getUserById({ userId });

  return (
    <>
      <h2 className="h1-bold text-dark100_light900">Edit Profile</h2>
      <div className="mt-9">
        <ProfileForm clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  );
};

export default EditProfilePage;
