import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const PAPER = "#F5F3EC";
const INK = "#1A1916";
const AMBER = "#E0A300";
const AMBER_INK = "#6B4E00";
const FAINT = "#8A877C";
const SUNK = "#E7E4D8";

/** Dynamic per-teardown Open Graph image, art-directed in the Dossier aesthetic. */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = (searchParams.get("target") || "a product").slice(0, 38);
  const claims = searchParams.get("c");
  const unverified = searchParams.get("u") ?? "0";
  const stat = `CASE FILE · ${claims ?? "—"} CLAIMS · ${unverified} UNVERIFIED`;

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
            "radial-gradient(900px 500px at 12% -10%, rgba(224,163,0,0.12), transparent), radial-gradient(rgba(26,25,22,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 18px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "9px", background: AMBER, display: "flex" }} />
            <div style={{ fontSize: "24px", letterSpacing: "6px", color: INK, fontWeight: 700 }}>RECEIPTS</div>
          </div>
          <div style={{ fontSize: "20px", letterSpacing: "3px", color: FAINT }}>{stat}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "30px", letterSpacing: "2px", color: FAINT }}>THE TEARDOWN</div>
          <div
            style={{
              display: "flex",
              fontSize: "104px",
              lineHeight: 1.0,
              letterSpacing: "-4px",
              color: AMBER_INK,
              fontWeight: 700,
              maxWidth: "1040px",
            }}
          >
            {target}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: `2px solid ${AMBER}`,
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "22px",
                color: AMBER_INK,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" style={{ display: "flex" }}>
                <path d="M5 12.5l4 4 10-11" fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              every claim sourced
            </div>
            <div style={{ display: "flex", width: "120px", height: "26px", borderRadius: "4px", background: INK }} />
          </div>
          <div style={{ fontSize: "26px", letterSpacing: "3px", color: INK, fontWeight: 600 }}>NO SOURCE, NO CLAIM.</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
