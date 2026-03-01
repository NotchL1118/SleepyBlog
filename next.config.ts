import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";

const nextConfig: NextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Optionally, add any other Next.js config below
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pic.lsyfighting.cn" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeUnwrapImages],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
