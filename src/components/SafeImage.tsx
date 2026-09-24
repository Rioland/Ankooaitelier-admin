"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** next/image with a branded fallback when the src is missing or fails to load. */
export default function SafeImage({ src, alt, className, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200",
          className
        )}
        aria-label={alt}
        role="img"
      >
        <svg viewBox="0 0 64 64" className="h-1/4 max-h-16 w-1/4 max-w-16 text-brand-400/70" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 10 12 16l4 10 6-3v31h20V23l6 3 4-10-10-6c-1 4-5 7-10 7s-9-3-10-7Z" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return <Image src={src} alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}
