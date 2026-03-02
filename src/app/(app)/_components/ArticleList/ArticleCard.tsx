import { CalendarIcon, ClockIcon, FireIcon } from "@/components/Icons";
import Link from "next/link";

interface IArticleCardProps {
  slug: string;
  title: string;
  content: string;
  coverImage?: string;
  mode: "normal" | "reverse";
  date?: string | Date;
  viewCount?: number;
  readingTime?: number;
}
// TODO 替换图片
const defaultImage = "/images/heroBannerBg.jpeg";
const ArticleCard = ({ title, content, coverImage, slug, mode, date, viewCount, readingTime }: IArticleCardProps) => {
  const renderImage = () => {
    // 斜线filter切割方向样式
    return (
      <div
        className="h-full w-[45%] bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out hover:scale-125"
        style={{
          backgroundImage: `url(${coverImage || defaultImage})`,
          clipPath:
            mode === "reverse" ? "polygon(10% 0, 100% 0, 100% 100%, 0 100%)" : "polygon(0 0, 100% 0, 90% 100%, 0 100%)",
        }}
      />
    );
  };

  const renderOtherInfo = () => {
    // 格式化日期
    const formatDate = (dateString?: string | Date) => {
      if (!dateString) return "";
      if (typeof dateString === "string") {
        return new Date(dateString).toLocaleDateString("zh-CN");
      }
      return dateString.toLocaleDateString("zh-CN");
    };

    return (
      <div className="mt-2 flex items-center space-x-4 text-xs text-white/60">
        <div className="flex items-center">
          <div className="mr-1.5 flex items-center justify-center rounded-full bg-blue-500 p-1">
            <CalendarIcon className="h-3 w-3 text-white" />
          </div>
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center">
          <div className="mr-1.5 flex items-center justify-center rounded-full bg-red-500 p-1">
            <FireIcon className="h-3 w-3 text-white" />
          </div>
          <span>{viewCount || 0}</span>
        </div>
        {!!readingTime && (
          <div className="flex items-center">
            <div className="mr-1.5 flex items-center justify-center rounded-full bg-blue-500 p-1">
              <ClockIcon className="h-3 w-3 text-white" />
            </div>
            <span>{readingTime} 分钟</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Link href={`/article/${slug}`}>
      <div className="relative flex h-[190px] overflow-hidden rounded-md bg-black md:h-60 lg:h-52 xl:h-60">
        <div
          style={{
            // TODO 替换图片
            backgroundImage: `url(${coverImage || defaultImage})`,
          }}
          className="absolute h-full w-full bg-cover bg-center blur-xl brightness-[0.6]"
        />
        {mode === "normal" && renderImage()}
        <div className="z-10 flex h-full flex-1 flex-col p-10">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="line-clamp-3 indent-4 text-sm text-white/80">{content}</p>
          </div>
          {renderOtherInfo()}
        </div>
        {mode === "reverse" && renderImage()}
      </div>
    </Link>
  );
};

export default ArticleCard;
