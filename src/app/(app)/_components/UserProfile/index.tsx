import Image from "next/image";
import React from "react";

const UserProfile: React.FC = () => {
  // 数据写死在组件内部，未来会从接口获取
  const userData = {
    avatarUrl: "/images/avatar.png",
    backgroundUrl: "/images/userInfoBg.jpg",
    username: "早睡早起有益健康",
    bio: "记得要早睡早起～",
    socialLinks: [{ platform: "github", url: "https://github.com/NotchL1118" }],
  };

  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden rounded-lg p-6 py-10 text-white shadow-md">
      <div className="absolute inset-0 z-0">
        <Image src={userData.backgroundUrl} alt="backgroundImage" fill className="object-cover" priority />
      </div>
      <div className="z-10 flex w-full flex-col items-center">
        <div className="group flex w-full flex-col items-center">
          <div className="relative mb-5 h-20 w-20 overflow-hidden rounded-full border-2 border-white transition-all duration-500 hover:transform group-hover:rotate-[360deg] group-hover:opacity-0">
            <Image src={userData.avatarUrl} alt={userData.username} fill className="object-cover" />
          </div>
          <div className="flex flex-col items-center transition-all duration-500 group-hover:cursor-default group-hover:opacity-0">
            <h2 className="mb-3 line-clamp-1 text-xl font-bold">{userData.username}</h2>
            <p className="mb-8 px-4 text-center text-sm text-gray-300">{userData.bio}</p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center">
          {/* <div className="mt-4 text-sm text-gray-400">社交账号</div> */}
          <div className="mt-16 flex w-full justify-center gap-5">
            {userData.socialLinks.map((link, index) => (
              <a key={index} href={link.url} className="text-red-500 hover:text-red-400">
                {link.platform === "github" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
