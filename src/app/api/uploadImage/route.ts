import * as qiniu from 'qiniu';
import { NextRequest, NextResponse } from 'next/server';

const accessKey = process.env.QINIU_AK!;
const secretKey = process.env.QINIU_SK!;
const bucket = process.env.QINIU_BUCKET!;
const domain = process.env.QINIU_DOMAIN!;

// 从 data URI 中提取 MIME 类型和 base64 数据
function parseDataUri(dataUri: string) {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

// 从 MIME 类型获取文件扩展名
function getExtFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[mimeType] || 'jpg';
}

// 生成随机文件名
function generateKey(ext: string, filename?: string): string {
  if (filename) {
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `covers/${Date.now()}-${safeName}`;
  }
  const random = Math.random().toString(36).substring(2, 10);
  return `covers/${Date.now()}-${random}.${ext}`;
}

export async function POST(request: NextRequest) {
  // 检查环境变量
  if (!accessKey || !secretKey || !bucket || !domain) {
    return NextResponse.json(
      { success: false, error: '七牛云配置缺失' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { base64: dataUri, filename } = body as { base64: string; filename?: string };

    if (!dataUri) {
      return NextResponse.json(
        { success: false, error: '缺少 base64 图片数据' },
        { status: 400 }
      );
    }

    // 解析 data URI
    const parsed = parseDataUri(dataUri);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: '无效的 base64 图片格式' },
        { status: 400 }
      );
    }

    const { mimeType, base64 } = parsed;
    const buffer = Buffer.from(base64, 'base64');
    const ext = getExtFromMime(mimeType);
    const key = generateKey(ext, filename);

    // 配置七牛
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const putPolicy = new qiniu.rs.PutPolicy({ scope: `${bucket}:${key}` });
    const uploadToken = putPolicy.uploadToken(mac);

    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    putExtra.mimeType = mimeType;

    // 上传
    const { data, resp } = await formUploader.put(uploadToken, key, buffer, putExtra);

    if (resp.statusCode !== 200) {
      return NextResponse.json(
        { success: false, error: '上传失败', details: data },
        { status: 500 }
      );
    }

    const url = `${domain}/${key}`;
    return NextResponse.json({ success: true, url, key });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '上传失败' },
      { status: 500 }
    );
  }
}
