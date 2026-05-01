import Image from "next/image";

export function PromotickLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Image
      src="https://www.promotick.com/Resources/public/web//img/Logos/Logo-Promotick-White.svg"
      alt="Promotick"
      width={600}
      height={120}
      priority
      className={className}
    />
  );
}
