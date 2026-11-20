import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * تصویر محصول. فایل‌های SVG (تصاویر نمونه‌ی seed) داخل کادر «contain» می‌شوند
 * و بهینه‌سازی نمی‌شوند؛ عکس‌های واقعی کادر را کامل پر می‌کنند.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const isSvg = /\.svg(\?|$)/i.test(src);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isSvg}
      className={cn(
        isSvg ? "object-contain p-[9%]" : "object-cover",
        className,
      )}
    />
  );
}
