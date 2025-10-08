import { serialize } from "next-mdx-remote/serialize";
import { NextRequest, NextResponse } from "next/server";
import remarkGfm from "remark-gfm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const source = typeof body?.source === "string" ? body.source : "";

    if (!source) {
      return NextResponse.json({ ok: true, mdx: null });
    }

    const mdx = await serialize(source, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
        format: "mdx",
      },
      parseFrontmatter: false,
    });

    return NextResponse.json({ ok: true, mdx });
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message || "Failed to compile MDX" }, { status: 500 });
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to compile MDX" },
      { status: 500 }
    );
  }
}
