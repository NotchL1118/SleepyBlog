# 文章封面生成 API

基于豆包 Seedream 4.0 模型，根据文章概述生成封面图片的流式 API 接口。

## 接口信息

- **路径**: `/api/generateArticleCover`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **响应类型**: `text/event-stream` (SSE)

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `prompt` | `string` | ✅ | - | 文章概述或提示词，用于生成图片 |
| `maxImages` | `number` | ❌ | `4` | 最大生成图片数量，范围 `[1, 15]` |

### 请求示例

```json
{
  "prompt": "一篇关于人工智能未来发展的技术博客文章，探讨机器学习在医疗领域的应用前景",
  "maxImages": 4
}
```

## 响应格式

接口返回 SSE (Server-Sent Events) 流式数据，每个事件格式为：

```
data: {JSON对象}\n\n
```

### 事件类型

#### 1. `image_generation.partial_succeeded`

单张图片生成成功时触发。

```typescript
interface PartialSucceededEvent {
  type: "image_generation.partial_succeeded";
  model: string;           // 模型 ID
  created: number;         // Unix 时间戳（秒）
  image_index: number;     // 图片序号，从 0 开始
  b64_json: string;        // 图片的 Base64 编码
  size: string;            // 图片尺寸，如 "2048×2048"
}
```

**示例**:
```json
{
  "type": "image_generation.partial_succeeded",
  "model": "doubao-seedream-4-0-250828",
  "created": 1732963200,
  "image_index": 0,
  "b64_json": "/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "size": "2048×2048"
}
```

#### 2. `image_generation.partial_failed`

单张图片生成失败时触发（不影响其他图片生成）。

```typescript
interface PartialFailedEvent {
  type: "image_generation.partial_failed";
  model: string;
  created: number;
  image_index: number;
  error: {
    code: string;          // 错误码
    message: string;       // 错误信息
  };
}
```

**示例**:
```json
{
  "type": "image_generation.partial_failed",
  "model": "doubao-seedream-4-0-250828",
  "created": 1732963200,
  "image_index": 2,
  "error": {
    "code": "OutputImageSensitiveContentDetected",
    "message": "The request failed because the output image may contain sensitive information."
  }
}
```

#### 3. `image_generation.completed`

所有图片处理完成时触发（无论成功或失败），是流的最后一个事件。

```typescript
interface CompletedEvent {
  type: "image_generation.completed";
  model: string;
  created: number;
  usage: {
    generated_images: number;  // 成功生成的图片数量
    output_tokens: number;     // 消耗的 token 数
    total_tokens: number;      // 总 token 数
  };
}
```

**示例**:
```json
{
  "type": "image_generation.completed",
  "model": "doubao-seedream-4-0-250828",
  "created": 1732963200,
  "usage": {
    "generated_images": 3,
    "output_tokens": 49152,
    "total_tokens": 49152
  }
}
```

## 错误响应

### 非流式错误（HTTP 状态码非 200）

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
```

| 状态码 | code | 说明 |
|--------|------|------|
| 400 | `BadRequest` | 请求参数错误，如缺少 `prompt` |
| 500 | `ConfigError` | 服务端配置错误，如缺少 API 密钥 |
| 500 | `StreamError` | 流式响应获取失败 |
| 其他 | `UpstreamError` | 上游 API 返回的错误 |

## 前端调用示例

### 基础用法

```typescript
async function generateCover(prompt: string, maxImages = 4) {
  const response = await fetch("/api/generateArticleCover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxImages }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Failed to get reader");

  const decoder = new TextDecoder();
  const images: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      try {
        const event = JSON.parse(data);

        switch (event.type) {
          case "image_generation.partial_succeeded":
            images.push(event.b64_json);
            console.log(`图片 ${event.image_index + 1} 生成成功`);
            break;

          case "image_generation.partial_failed":
            console.error(`图片 ${event.image_index + 1} 生成失败:`, event.error.message);
            break;

          case "image_generation.completed":
            console.log(`完成！共生成 ${event.usage.generated_images} 张图片`);
            break;
        }
      } catch {
        // 忽略解析错误
      }
    }
  }

  return images;
}
```

### React Hook 示例

```typescript
import { useState, useCallback } from "react";

interface GeneratedImage {
  index: number;
  b64_json: string;
  size: string;
}

export function useCoverGenerator() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const generate = useCallback(async (prompt: string, maxImages = 4) => {
    setLoading(true);
    setError(null);
    setImages([]);
    setProgress({ current: 0, total: maxImages });

    try {
      const response = await fetch("/api/generateArticleCover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxImages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error.message);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);

            if (event.type === "image_generation.partial_succeeded") {
              setImages((prev) => [
                ...prev,
                {
                  index: event.image_index,
                  b64_json: event.b64_json,
                  size: event.size,
                },
              ]);
              setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
            }

            if (event.type === "image_generation.completed") {
              setProgress({ current: event.usage.generated_images, total: event.usage.generated_images });
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { images, loading, error, progress, generate };
}
```

### 显示 Base64 图片

```tsx
// 将 b64_json 转为可用的图片 URL
function base64ToImageUrl(b64_json: string): string {
  return `data:image/jpeg;base64,${b64_json}`;
}

// 在 JSX 中使用
<img src={base64ToImageUrl(image.b64_json)} alt="Generated cover" />
```

## 图片规格

| 属性 | 值 |
|------|-----|
| 分辨率 | 2K（由模型自动选择最佳尺寸） |
| 格式 | JPEG |
| 水印 | 无 |
| 返回格式 | Base64 编码 |

## 注意事项

1. **提示词建议**：建议不超过 300 个汉字或 600 个英文单词，过长可能导致细节丢失
2. **生成时间**：单张图片生成约需 10-30 秒，组图模式下图片会逐个返回
3. **错误处理**：单张图片生成失败不影响其他图片，建议在前端处理部分失败的情况
4. **资源消耗**：Base64 编码的图片较大，注意内存管理
