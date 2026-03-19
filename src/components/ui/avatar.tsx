import Image from "next/image";
import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { className: string; pixels: number }> = {
  sm: { className: "h-8 w-8 text-xs", pixels: 32 },
  md: { className: "h-10 w-10 text-sm", pixels: 40 },
  lg: { className: "h-14 w-14 text-lg", pixels: 56 },
  xl: { className: "h-24 w-24 text-2xl", pixels: 96 },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  const { className: sizeClass, pixels } = sizeStyles[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={pixels}
        height={pixels}
        className={cn(
          "rounded-full object-cover",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center",
        sizeClass,
        className
      )}
    >
      {getInitials(alt)}
    </div>
  );
}
