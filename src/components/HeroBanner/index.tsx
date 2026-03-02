import Typewriter from "../Typewriter";
import Wave from "./Wave";

export default function HeroBanner() {
  const sentences = ["早睡早起有益健康", "多喝水有助于身体健康", "每天坚持锻炼身体", "保持积极乐观的心态"];
  return (
    <div className="relative -z-0 h-[498px] w-full bg-white transition-colors dark:bg-gray-900">
      <div
        style={{ backgroundImage: "url(/images/heroBannerBg.jpeg)" }}
        className="flex h-full w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      >
        <Typewriter
          className="max-w-[60%] font-LXGW text-3xl font-bold text-white"
          cursorColor="grey"
          texts={sentences}
        />
      </div>
      <Wave />
    </div>
  );
}
