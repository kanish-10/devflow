import React from "react";
import Navbar from "@/components/shared/bars/Navbar";
import LeftSidebar from "@/components/shared/bars/LeftSidebar";
import RightSidebar from "@/components/shared/bars/RightSidebar";
import { auth } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();
  return (
    <main className="background-light850_dark100 relative">
      <Navbar userId={userId} />
      <div className="flex">
        <LeftSidebar userId={userId} />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
        <RightSidebar />
      </div>
      <Toaster />
    </main>
  );
};

export default RootLayout;
