import Image from "next/image";

const Info = () => {
  return (
    <div className="mx-auto flex w-[90%] flex-col items-center justify-between sm:flex-row lg:w-[950px]">
      <div className="h-[40%] w-[40%]">
        <Image
          loading="lazy"
          width={2100}
          height={2100}
          className="max-h-full w-full rounded-full object-cover shadow-lg"
          src="/images/avatar.png"
          alt="avatar"
        />
      </div>
      <div className="flex flex-col items-center justify-center sm:w-[50%] sm:items-start">
        <h2 className="bg-clip-text text-xl font-semibold text-[#4facfe] lg:text-4xl">Who Am I ?</h2>
        <p className="my-2 text-xl font-bold sm:my-4 lg:my-5 lg:text-4xl">I am SleepYoung~</p>
        <p className="text-sm font-semibold text-zinc-500">
          一位目标全栈的<span className="line-through">(切图仔)</span>前端工程师
        </p>
      </div>
    </div>
  );
};

export default Info;
