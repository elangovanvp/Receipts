import { ImageResponse } from "next/og";

export const alt =
  "Receipts — competitive teardowns that show their receipts. No source, no claim.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F5F3EC";
const INK = "#1A1916";
const AMBER = "#E0A300";
const AMBER_INK = "#6B4E00";
const FAINT = "#8A877C";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px",
          backgroundImage:
            "radial-gradient(rgba(26,25,22,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "9px",
              background: AMBER,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "24px",
              letterSpacing: "6px",
              color: INK,
              fontWeight: 700,
            }}
          >
            RECEIPTS
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            style={{
              fontSize: "82px",
              lineHeight: 1.04,
              letterSpacing: "-3px",
              color: INK,
              fontWeight: 700,
              maxWidth: "1000px",
            }}
          >
            Competitive teardowns that
          </div>
          <div
            style={{
              fontSize: "82px",
              lineHeight: 1.04,
              letterSpacing: "-3px",
              color: AMBER_INK,
              fontWeight: 700,
            }}
          >
            show their receipts.
          </div>
        </div>

        {/* evidence chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Chip label="linear.app" color={AMBER_INK} stroke={AMBER} />
          <Chip label="pricing" color={INK} stroke={INK} border="rgba(26,25,22,0.25)" />
          <div
            style={{
              display: "flex",
              width: "120px",
              height: "26px",
              borderRadius: "4px",
              background: INK,
            }}
          />
        </div>

        {/* footer line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "26px", letterSpacing: "4px", color: INK, fontWeight: 600 }}>
            NO SOURCE, NO CLAIM.
          </div>
          <div style={{ fontSize: "22px", color: FAINT }}>
            one agent · two tools · zero fairy tales
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Chip({
  label,
  color,
  stroke,
  border,
}: {
  label: string;
  color: string;
  stroke: string;
  border?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        border: `2px solid ${border ?? stroke}`,
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "22px",
        color,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ display: "flex" }}>
        <path
          d="M5 12.5l4 4 10-11"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </div>
  );
}
