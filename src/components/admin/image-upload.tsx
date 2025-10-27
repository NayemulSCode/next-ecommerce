"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = "",
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 初始化已有图片
  useState(() => {
    if (value && value.length > 0) {
      const initialImages = value.map((url, index) => ({
        id: `existing-${index}`,
        url,
        name: url.split("/").pop() || `image-${index}`,
        size: 0,
        type: "image/jpeg",
      }));
      setUploadedImages(initialImages);
    }
  });

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    return {
      id: data.fileName,
      url: data.url,
      name: data.originalName,
      size: data.size,
      type: data.type,
    };
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // 检查文件数量限制
      const totalFiles = uploadedImages.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          try {
            const result = await uploadFile(file);
            setUploadProgress(
              (prev) => ((index + 1) / acceptedFiles.length) * 100
            );
            return result;
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}`);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(
          (result): result is UploadedImage => result !== null
        );

        if (successfulUploads.length > 0) {
          const newImages = [...uploadedImages, ...successfulUploads];
          setUploadedImages(newImages);

          const urls = newImages.map((img) => img.url);
          onChange?.(urls);

          toast.success(
            `${successfulUploads.length} image(s) uploaded successfully`
          );
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload failed");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [uploadedImages, maxFiles, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize,
    multiple: true,
    disabled: uploading || uploadedImages.length >= maxFiles,
  });

  const removeImage = async (imageId: string) => {
    const image = uploadedImages.find((img) => img.id === imageId);
    if (!image) return;

    // 如果是新上传的图片，尝试从服务器删除
    if (!image.id.startsWith("existing-")) {
      try {
        await fetch(`/api/upload?fileName=${image.id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete image from server:", error);
      }
    }

    const newImages = uploadedImages.filter((img) => img.id !== imageId);
    setUploadedImages(newImages);

    const urls = newImages.map((img) => img.url);
    onChange?.(urls);

    toast.success("Image removed");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            } ${
              uploading || uploadedImages.length >= maxFiles
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <div>
                  <p className="font-medium">Uploading images...</p>
                  <Progress value={uploadProgress} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {isDragActive
                      ? "Drop images here"
                      : "Upload product images"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, WebP up to {formatFileSize(maxSize)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedImages.length}/{maxFiles} images uploaded
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(image.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate">{image.name}</p>
                  {image.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Upload Limits Info */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          <ImageIcon className="h-3 w-3 mr-1" />
          Max {maxFiles} files
        </Badge>
        <Badge variant="outline">Max {formatFileSize(maxSize)} per file</Badge>
        <Badge variant="outline">PNG, JPG, GIF, WebP</Badge>
      </div>
    </div>
  );
}
