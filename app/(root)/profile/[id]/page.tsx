import { URLProps } from "@/types";
import { getUserInfo } from "@/lib/actions/user.action";
import Image from "next/image";
import { auth, SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFormattedJoinedDate } from "@/lib/utils";
import ProfileLink from "@/components/shared/ProfileLink";
import Stats from "@/components/shared/Stats";
import QuestionTab from "@/components/shared/tab/QuestionTab";
import AnswerTab from "@/components/shared/tab/AnswerTab";

const ProfilePage = async ({ params, searchParams }: URLProps) => {
  const { userId } = auth();
  const { id: clerkId } = params;
  const userInfo = await getUserInfo({ userId: clerkId });
  return (
    <>
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <Image
            src={userInfo?.user.picture}
            alt="profile picture"
            width={140}
            height={140}
            className="rounded-full object-cover"
          />
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">
              {userInfo?.user.name}
            </h2>
            <p className="paragraph-regular text-dark200_light800">
              @{userInfo?.user.username}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {userInfo.user.portfolio && (
                <ProfileLink
                  icon="/assets/icons/link.svg"
                  title="Portfolio"
                  href={userInfo.user.portfolio}
                />
              )}
              {userInfo.user.location && (
                <ProfileLink
                  icon="/assets/icons/location.svg"
                  title={userInfo.user.location}
                />
              )}
              <ProfileLink
                title={getFormattedJoinedDate(userInfo.user.joinedAt)}
                icon="/assets/icons/calendar.svg"
              />
            </div>
            {userInfo.user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {userInfo.user.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          <SignedIn>
            {userId === userInfo.user.clerkId && (
              <Link href="/profile/edit">
                <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-[46px] min-w-[175px] px-4 py-3">
                  Edit profile
                </Button>
              </Link>
            )}
          </SignedIn>
        </div>
        0
      </div>
      <Stats
        reputation={userInfo.reputation}
        totalQuestions={userInfo.totalQuestions}
        totalAnswers={userInfo.totalAnswers}
        badges={userInfo.badgeCount}
      />
      <div className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-1">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="top-posts">
            <QuestionTab
              searchParams={searchParams}
              userId={userInfo.user._id}
              clerkId={userId}
            />
          </TabsContent>
          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            <AnswerTab
              searchParams={searchParams}
              userId={userInfo.user._id}
              clerkId={userId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProfilePage;
