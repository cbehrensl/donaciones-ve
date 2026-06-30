import { NextResponse } from "next/server";
import { getDonationLinksActivas } from "@/lib/data";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { ...CORS } });
}

export async function GET() {
  try {
    const data = await getDonationLinksActivas();

    return NextResponse.json(
      { ok: true, data, count: data.length, timestamp: new Date().toISOString() },
      { headers: { ...CORS, ...CACHE } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error al obtener links de donación" },
      { status: 500, headers: CORS },
    );
  }
}
