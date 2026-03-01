import ArticleList from "@/app/components/ArticleList";
import UserProfile from "@/app/components/UserProfile";
import HeroBanner from "@/components/HeroBanner";

export default function Index() {
  return (
    <div className="h-full min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-900 dark:text-gray-100">
      <HeroBanner />
      <div className="mx-auto flex flex-row justify-between sm:w-[54%] md:w-[58%] lg:w-[60%]">
        <div className="mr-0 flex-1 sm:mr-4">
          <ArticleList />
        </div>
        <div className="flex w-0 flex-col items-start overflow-hidden sm:w-[30%] md:w-[28%] lg:w-[24%]">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
