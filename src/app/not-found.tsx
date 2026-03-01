import Link from "next/link";

export default function NotFound() {
  return (
    <div className="avoidHeader flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">页面不存在</h2>
        <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">抱歉，该页面暂不存在</p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            返回首页
          </Link>
          <Link
            href="/list"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            查看所有文章
          </Link>
        </div>
      </div>
    </div>
  );
}
