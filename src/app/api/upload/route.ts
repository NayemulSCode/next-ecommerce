import { authOptions } from "@/lib/auth/config";
import { mkdir, unlink, writeFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// 支持的图片格式
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 只有管理员可以上传图片
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // 确保上传目录存在
    const uploadsDir = join(process.cwd(), "public", "uploads", "products");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 保存文件
    const filePath = join(uploadsDir, uniqueFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // 构建文件 URL
    const fileUrl = `/uploads/products/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// 处理批量上传
export async function PUT(request: NextRequest) {
  try {
    // 检查用户权限
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      // 验证文件类型
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}`);
      }

      // 验证文件大小
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.name}`);
      }

      // 生成唯一文件名
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;

      // 确保上传目录存在
      const uploadsDir = join(process.cwd(), "public", "uploads", "products");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // 目录可能已存在，忽略错误
      }

      // 保存文件
      const filePath = join(uploadsDir, uniqueFileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);

      // 构建文件 URL
      const fileUrl = `/uploads/products/${uniqueFileName}`;

      return {
        success: true,
        url: fileUrl,
        fileName: uniqueFileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      };
    });

    const results = await Promise.allSettled(uploadPromises);

    const successful = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);
    const failed = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    return NextResponse.json({
      success: true,
      uploaded: successful,
      failed: failed,
      total: files.length,
      successfulCount: successful.length,
      failedCount: failed.length,
    });
  } catch (error) {
    console.error("Batch image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

// 删除图片
export async function DELETE(request: NextRequest) {
  try {
    // 检查用户权限
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }

    // 安全检查：确保文件名不包含路径遍历字符
    if (
      fileName.includes("..") ||
      fileName.includes("/") ||
      fileName.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      fileName
    );

    try {
      await unlink(filePath);

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "File not found or could not be deleted" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Image delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
