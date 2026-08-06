export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const gradientId = "fx-grad";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="FolioX logo"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(32 95% 56%)" />
          <stop offset="100%" stopColor="hsl(20 85% 50%)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${gradientId})`} />
      <circle cx="16" cy="16" r="10.5" stroke="hsl(252 30% 8%)" strokeOpacity="0.25" strokeWidth="0.6" />
      <circle cx="16" cy="16" r="8" stroke="hsl(252 30% 8%)" strokeOpacity="0.30" strokeWidth="0.6" />
      <circle cx="16" cy="16" r="5" fill="hsl(252 30% 10%)" />
      <circle cx="16" cy="16" r="1.4" fill="hsl(32 95% 56%)" />
      <path
        d="M7 21 C 11 14, 17 14, 21 18 L 24 15"
        stroke="hsl(252 14% 96%)"
        strokeOpacity="0.9"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22.5 14.5 L24.6 14.5 L24.6 16.6"
        stroke="hsl(252 14% 96%)"
        strokeOpacity="0.9"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={38} />
      <span className="font-display text-[17px] font-bold tracking-tight">FolioX</span>
    </div>
  );
}
