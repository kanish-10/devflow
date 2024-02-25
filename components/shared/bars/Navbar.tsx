import Link from "next/link";
import Image from "next/image";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Theme from "@/components/shared/theme/Theme";
import MobileNav from "@/components/shared/bars/MobileNav";
import GlobalSearch from "@/components/shared/search/GlobalSearch";

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/assets/images/site-logo.svg"
          alt="DevFlow"
          height={23}
          width={23}
        />
        <p className="h2-bold font-spaceGrotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev<span className="text-primary-500">Flow</span>
        </p>
      </Link>
      <GlobalSearch />
      <div className="flex-between gap-5">
        <Theme />
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
              variables: {
                colorPrimary: "#FF7000",
              },
            }}
          />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
