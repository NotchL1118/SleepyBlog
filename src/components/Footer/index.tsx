import Image from "next/image";
import BackToTop from "./BackToTop";
import styles from "./index.module.scss";
import RunningTime from "./RunningTime";

// 随机一句话
const quotes = [
  "早睡早起有益健康",
  "祝你早安、午安、晚安",
  "保持热爱，奔赴山海",
  "愿你历尽千帆，归来仍是少年",
  "你今年必发大财",
  "无限进步",
];
const ICP = `豫ICP备2022018810号-1`;
const COPYRIGHT_TEXT = `Copyright © 2024-${new Date().getFullYear()}. All Rights Reserved.`;
export default async function Footer() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    <>
      <footer className="mt-20 w-full border-t border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* 左侧：头像 */}
            <div className="flex-shrink-0">
              <div className={styles.avatarContainer}>
                <div className={styles.avatarImageWrapper}>
                  <Image src="/images/avatar.png" fill alt="Avatar" />
                </div>
              </div>
            </div>

            {/* 中间：信息区域 */}
            <div className="flex-1 space-y-3 text-center">
              {/* 运行天数 */}
              <RunningTime />

              {/* 随机一句话 */}
              <p className="text-sm italic text-gray-500 dark:text-gray-500">&ldquo;{randomQuote}&rdquo;</p>

              {/* 又拍云 */}
              <p>
                <a
                  href="https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-sm text-gray-500 dark:text-gray-500">本网站由</span>
                  <Image src="/images/upyun.png" width={45} height={20} alt="又拍云" className="mx-1 inline-block" />
                  <span className="text-sm text-gray-500 dark:text-gray-500">提供CDN加速/云存储服务</span>
                </a>
              </p>

              {/* 版权信息 */}
              <p className="text-xs text-gray-500 dark:text-gray-500">{COPYRIGHT_TEXT}</p>

              {/* 备案号 */}
              <p className="text-xs text-gray-400 dark:text-gray-600">
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {ICP}
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* 返回顶部按钮 */}
      <BackToTop />
    </>
  );
}
