import { NextRequest, NextResponse } from "next/server";
import { getRefugios } from "@/lib/data";

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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const zona = searchParams.get("zona") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  try {
    const data = await getRefugios({ zona, q });

    return NextResponse.json(
      { ok: true, data, count: data.length, timestamp: new Date().toISOString() },
      { headers: { ...CORS, ...CACHE } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error al obtener refugios" },
      { status: 500, headers: CORS },
    );
  }
}
