import type { Asset } from "@/lib/types";

/** Per-type line art drawn over the asset's gradient tile. */
function CoverArt({ asset, accent }: { asset: Asset; accent: string }) {
  const gradient = `url(#g-${asset.id})`;

  switch (asset.type) {
    case "channel":
      return (
        <>
          <rect x="16" y="18" width="68" height="44" rx="8" fill={gradient} opacity="0.5" />
          <rect
            x="24"
            y="28"
            width="52"
            height="24"
            rx="5"
            stroke={accent}
            strokeOpacity="0.85"
            strokeWidth="2"
            fill="none"
          />
          <path d="M39 34 L54 40 L39 46 Z" fill="#fff" fillOpacity="0.78" />
          <circle cx="25" cy="74" r="4" fill={accent} fillOpacity="0.8" />
          <circle cx="50" cy="74" r="4" fill={accent} fillOpacity="0.55" />
          <circle cx="75" cy="74" r="4" fill={accent} fillOpacity="0.35" />
        </>
      );

    case "video":
      return (
        <>
          <rect
            x="13"
            y="21"
            width="74"
            height="48"
            rx="8"
            stroke={accent}
            strokeOpacity="0.75"
            strokeWidth="2"
            fill="none"
          />
          <path d="M42 34 L64 45 L42 56 Z" fill={gradient} />
          <path d="M18 76 H82" stroke={accent} strokeOpacity="0.35" strokeWidth="2" />
        </>
      );

    case "series":
      return (
        <>
          {[0, 1, 2].map((index) => (
            <rect
              key={index}
              x={18 + index * 9}
              y={20 + index * 7}
              width="52"
              height="34"
              rx="7"
              stroke={accent}
              strokeOpacity={0.75 - index * 0.18}
              strokeWidth="2"
              fill={index === 2 ? gradient : "none"}
            />
          ))}
          <path d="M45 43 L58 50 L45 57 Z" fill="#fff" fillOpacity="0.72" />
        </>
      );

    case "film":
      return (
        <>
          <rect x="18" y="18" width="64" height="58" rx="5" fill={gradient} opacity="0.38" />
          {[22, 34, 46, 58, 70].map((x) => (
            <path
              key={x}
              d={`M${x} 20 V74`}
              stroke="#fff"
              strokeOpacity="0.16"
              strokeWidth="3"
              strokeDasharray="4 7"
            />
          ))}
          <path
            d="M35 38 H68 M35 50 H61 M35 62 H72"
            stroke={accent}
            strokeOpacity="0.7"
            strokeWidth="2"
          />
        </>
      );

    case "book":
      return (
        <>
          <path
            d="M22 22 H48 C55 22 61 26 61 34 V76 C55 71 49 69 42 69 H22 Z"
            fill={gradient}
            opacity="0.5"
          />
          <path
            d="M61 34 C61 26 67 22 74 22 H78 V69 H69 C66 69 63 71 61 76 Z"
            fill={accent}
            fillOpacity="0.22"
          />
          <path
            d="M31 36 H50 M31 45 H50 M31 54 H46"
            stroke="#fff"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        </>
      );

    case "game":
      return (
        <>
          <path
            d="M24 55 C25 41 34 35 50 35 C66 35 75 41 76 55 C77 65 71 69 65 63 L58 56 H42 L35 63 C29 69 23 65 24 55Z"
            fill={gradient}
            opacity="0.55"
          />
          <path
            d="M36 48 H48 M42 42 V54"
            stroke="#fff"
            strokeOpacity="0.72"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="61" cy="46" r="3" fill="#fff" fillOpacity="0.7" />
          <circle cx="68" cy="52" r="3" fill="#fff" fillOpacity="0.55" />
        </>
      );

    case "ugc":
      return (
        <>
          <path
            d="M30 35 L52 24 L74 38 L66 65 L38 70 Z"
            stroke={accent}
            strokeOpacity="0.55"
            strokeWidth="2"
            fill={gradient}
            fillOpacity="0.22"
          />
          {(
            [
              [30, 35],
              [52, 24],
              [74, 38],
              [66, 65],
              [38, 70],
              [50, 49],
            ] as const
          ).map(([cx, cy], index) => (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={index === 5 ? 6 : 4}
              fill={accent}
              fillOpacity={index === 5 ? 0.85 : 0.55}
            />
          ))}
          <path
            d="M30 35 L50 49 L74 38 M50 49 L66 65 M50 49 L38 70"
            stroke="#fff"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
        </>
      );

    // Music and anything else falls back to the waveform treatment.
    default:
      return (
        <>
          <path
            d="M10 70 Q 30 30, 50 50 T 90 30"
            stroke={accent}
            strokeOpacity="0.7"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M10 78 Q 30 38, 50 58 T 90 38"
            stroke={accent}
            strokeOpacity="0.5"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M10 86 Q 30 46, 50 66 T 90 46"
            stroke={accent}
            strokeOpacity="0.3"
            strokeWidth="1.0"
            fill="none"
          />
          <circle cx="78" cy="32" r="4" fill={accent} fillOpacity="0.85" />
        </>
      );
  }
}

export function AssetCover({
  asset,
  size = 96,
  className = "",
}: {
  asset: Asset;
  size?: number;
  className?: string;
}) {
  const [accent, accentEnd] = asset.coverAccent;
  const monogram = asset.title
    .replace(/[^A-Za-z÷=−0-9]/g, "")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden rounded-md ${className}`}
      style={{ width: size, height: size, background: asset.cover }}
      role="img"
      aria-label={`${asset.title} cover art`}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${asset.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
            <stop offset="100%" stopColor={accentEnd} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <CoverArt asset={asset} accent={accent} />
      </svg>
      <div
        className="absolute right-1.5 bottom-1.5 font-display font-bold text-white/85 drop-shadow"
        style={{ fontSize: Math.max(10, size * 0.13), letterSpacing: "-0.02em" }}
      >
        {monogram}
      </div>
    </div>
  );
}
