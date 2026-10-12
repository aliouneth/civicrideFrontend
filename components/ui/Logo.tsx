import Image from "next/image";

interface Props {
  variant?: "lockup" | "mark";
  /** Rendered height in px; width follows the art's intrinsic ratio (no CLS). */
  height?: number;
  /** Puts the mark on a white plate — required on navy/dark surfaces, since
   *  the shield artwork is itself navy and would vanish into the field. */
  plated?: boolean;
  alt?: string;
  priority?: boolean;
  className?: string;
}

const ART = {
  lockup: { src: "/brand/lockup.png", width: 826, height: 273 },
  mark: { src: "/brand/mark.png", width: 253, height: 273 },
} as const;

export function Logo({
  variant = "lockup",
  height = 32,
  plated = false,
  alt = "CivicRide",
  priority = false,
  className = "",
}: Props) {
  const art = ART[variant];
  const dims = {
    src: art.src,
    alt,
    priority,
    width: Math.round((art.width / art.height) * height),
    height,
  };

  if (!plated) return <Image {...dims} className={className} />;

  return (
    <span className={`inline-flex items-center rounded-xl bg-white p-1 shadow-sm ${className}`}>
      <Image {...dims} className="rounded-lg" />
    </span>
  );
}