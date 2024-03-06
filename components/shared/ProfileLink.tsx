import Image from "next/image";
import Link from "next/link";

interface ProfileLinkProps {
  title: string;
  icon: string;
  href?: string;
}

const ProfileLink = ({ title, icon, href }: ProfileLinkProps) => {
  return (
    <div className="flex-center gap-1">
      <Image src={icon} alt="icon" width={20} height={20} />
      {href ? (
        <Link
          href={href}
          target="_blank"
          className="paragraph-medium text-blue-500"
        >
          {title}
        </Link>
      ) : (
        <p className="paragraph-medium text-dark400_light700">{title}</p>
      )}
    </div>
  );
};

export default ProfileLink;
