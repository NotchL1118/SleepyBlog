import { GitHubIcon, GoogleIcon } from "@/components/Icons";
import Image from "next/image";

const LOGIN_METHOD_ICONS: Record<string, React.FC<{ className?: string }>> = {
  github: GitHubIcon,
  google: GoogleIcon,
};

interface AvatarWithBadgeProps {
  image: string | null | undefined;
  name: string | null | undefined;
  email: string | null | undefined;
  loginMethod: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
}

export default function AvatarWithBadge({
  image,
  name,
  email,
  loginMethod,
  size = "sm",
  className = "",
}: AvatarWithBadgeProps) {
  const avatarSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const badgeSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const textSize = size === "sm" ? "text-sm" : "text-lg";

  const IconComponent = loginMethod ? LOGIN_METHOD_ICONS[loginMethod] : null;

  return (
    <div className={`relative ${className}`}>
      {/* 头像 */}
      {image ? (
        <Image
          src={image}
          alt={name || "用户头像"}
          width={size === "sm" ? 32 : 40}
          height={size === "sm" ? 32 : 40}
          className={`${avatarSize} rounded-full object-cover`}
          unoptimized
        />
      ) : (
        <div
          className={`${avatarSize} flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ${textSize} font-medium text-white`}
        >
          {name?.charAt(0) || email?.charAt(0) || "U"}
        </div>
      )}

      {/* 登录方式徽章 */}
      {IconComponent && (
        <div
          className={`absolute -right-0.5 -bottom-0.5 z-10 ${badgeSize} flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800`}
        >
          <IconComponent className={iconSize} />
        </div>
      )}
    </div>
  );
}
