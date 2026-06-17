import type { Metadata } from "next";
import { Landing } from "@/components/Landing";

type Params = Promise<{ target: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

function ogUrl(name: string, sp: Record<string, string | string[] | undefined>) {
  const c = typeof sp.c === "string" ? `&c=${sp.c}` : "";
  const u = typeof sp.u === "string" ? `&u=${sp.u}` : "";
  return `/api/og?target=${encodeURIComponent(name)}${c}${u}`;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const { target } = await params;
  const sp = await searchParams;
  const name = decodeURIComponent(target);
  const image = ogUrl(name, sp);
  const title = `Receipts — teardown: ${name}`;
  const description = `A sourced competitive teardown of ${name}. Every claim links to its real source; anything unverifiable is shown, not invented.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage({ params }: { params: Params }) {
  const { target } = await params;
  return <Landing initialTarget={decodeURIComponent(target)} />;
}
