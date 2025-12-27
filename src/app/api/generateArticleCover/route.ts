import { NextRequest, NextResponse } from "next/server";

// TODO: 实现鉴权逻辑

interface GenerateCoverRequest {
  prompt: string;
  maxImages?: number;
}

const SYSTEM_PROMPT = `
帮我生成文章的封面图片:不需要太正式,图片宽高比为4:3,根据文章内容你自行生成美观的封面图片,可以生成多张风格不同的图片供我来进行挑选,这是文章概述:
`;

export async function POST(request: NextRequest) {
  // 1. 验证环境变量
  const ARK_API_URL = process.env.ARK_API_URL;
  const ARK_API_KEY = process.env.ARK_API_KEY;
  const ARK_MODEL = process.env.ARK_MODEL_POINTER;

  if (!ARK_API_KEY || !ARK_MODEL || !ARK_API_URL) {
    return NextResponse.json({ error: { code: "ConfigError", message: "Missing API configuration" } }, { status: 500 });
  }

  // 2. 解析请求参数
  let body: GenerateCoverRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "BadRequest", message: "Invalid JSON body" } }, { status: 400 });
  }

  // 3. 验证必选参数
  if (!body.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ error: { code: "BadRequest", message: "prompt is required" } }, { status: 400 });
  }

  // 4. 处理 maxImages 参数
  const maxImages = Math.min(Math.max(body.maxImages ?? 4, 1), 15);

  // 5. 调用上游 API
  const arkResponse = await fetch(ARK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify({
      model: ARK_MODEL,
      prompt: `${SYSTEM_PROMPT}${body.prompt}`,
      size: "2K",
      response_format: "b64_json",
      stream: true,
      sequential_image_generation: "auto",
      sequential_image_generation_options: {
        max_images: maxImages,
      },
      watermark: false,
    }),
  });

  // 6. 处理上游错误
  if (!arkResponse.ok) {
    const errorText = await arkResponse.text();
    return NextResponse.json({ error: { code: "UpstreamError", message: errorText } }, { status: arkResponse.status });
  }

  // 7. 流式转发响应
  const reader = arkResponse.body?.getReader();
  if (!reader) {
    return NextResponse.json(
      { error: { code: "StreamError", message: "Failed to get response stream" } },
      { status: 500 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 直接转发 SSE 数据
          controller.enqueue(value);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: { code: "StreamError", message: errorMessage } })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
