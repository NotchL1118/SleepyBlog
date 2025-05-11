import Link from "next/link";
import { ClockIcon, FireIcon, NoteIcon } from "../../components/Icons";

interface IArticleCardProps {
  pageId: number;
  title: string;
  content: string;
  coverImage: string;
  mode: "normal" | "reverse";
}

const ArticleCard = ({ title, content, coverImage, pageId, mode }: IArticleCardProps) => {
  const renderImage = () => {
    // 斜线filter切割方向样式
    return (
      <div
        className="h-full w-[45%] bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out hover:scale-125"
        style={{
          backgroundImage: `url(${coverImage})`,
          clipPath:
            mode === "reverse" ? "polygon(10% 0, 100% 0, 100% 100%, 0 100%)" : "polygon(0 0, 100% 0, 90% 100%, 0 100%)",
        }}
      />
    );
  };

  const renderOtherInfo = () => {
    return (
      <div className="mt-2 flex items-center space-x-4 text-xs text-white/60">
        <div className="flex items-center">
          <div className="mr-1.5 flex items-center justify-center rounded-full bg-blue-500 p-1">
            <ClockIcon className="h-3 w-3 text-white" />
          </div>
          <span>2025-05-04</span>
        </div>
        <div className="flex items-center">
          <div className="mr-1.5 flex items-center justify-center rounded-full bg-red-500 p-1">
            <FireIcon className="h-3 w-3 text-white" />
          </div>
          <span>185</span>
        </div>
        <div className="flex items-center">
          <div className="mr-1.5 flex items-center justify-center rounded-full bg-amber-500 p-1">
            <NoteIcon className="h-3 w-3 text-white" />
          </div>
          <span>生活随笔</span>
        </div>
      </div>
    );
  };

  return (
    <Link href={`/article/${pageId}`}>
      <div className="relative flex h-[190px] overflow-hidden rounded-md bg-black md:h-60 lg:h-52 xl:h-60">
        <div
          style={{
            backgroundImage: `url(${coverImage})`,
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
