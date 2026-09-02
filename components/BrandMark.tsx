import Image from "next/image";

/** 미래에이아이랩 심볼 마크 (작은 공간용) */
export function MiraeMark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/mirae-ai-lab-mark.png"
      alt="미래에이아이랩"
      width={size}
      height={size}
      className={className}
      priority={false}
    />
  );
}

/** 미래에이아이랩 전체 로고 (심볼 + 워드마크) */
export function MiraeLogo({
  width = 132,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  return (
    <Image
      src="/mirae-ai-lab-logo.png"
      alt="미래에이아이랩"
      width={width}
      height={Math.round((width * 250) / 828)}
      className={className}
      priority={false}
    />
  );
}
