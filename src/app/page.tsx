import ArticleList from "@/components/ArticleList";
import HeroBanner from "@/components/HeroBanner";
import UserProfile from "@/components/UserProfile";

export default function Index() {
  return (
    <div className="h-full min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-900 dark:text-gray-100">
      <HeroBanner />
      <div className="mx-auto flex flex-row justify-between sm:w-[54%] md:w-[58%] lg:w-[60%]">
        <div className="mr-0 flex-1 bg-yellow-50 transition-colors sm:mr-4 dark:bg-gray-800">
          <ArticleList />
        </div>
        <div className="flex w-0 flex-col items-start overflow-hidden sm:w-[30%] md:w-[28%] lg:w-[24%]">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
