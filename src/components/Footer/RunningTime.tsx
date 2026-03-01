"use client";
import { useEffect, useState } from "react";
import { LightningIcon } from "../Icons";

const START_TIME = new Date("2025-10-08T00:00:00").getTime();
const padZero = (num: number) => String(num).padStart(2, "0");
export default function RunningTime() {
  const [runningTime, setRunningTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - START_TIME);

      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

      setRunningTime({ days, hours, minutes, seconds });
    };

    // 立即计算一次
    calculateTime();

    // 每秒更新一次
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <p className="text-sm text-gray-600 dark:text-gray-400">
      <span className="inline-flex items-center gap-2">
        <LightningIcon />
        小破站已运行
        <span className="mx-1 font-semibold text-blue-600 dark:text-blue-400">
          {padZero(runningTime.days)} 天 {padZero(runningTime.hours)} 时 {padZero(runningTime.minutes)} 分{" "}
          {padZero(runningTime.seconds)} 秒
        </span>
      </span>
    </p>
  );
}
