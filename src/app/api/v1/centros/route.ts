import { NextRequest, NextResponse } from "next/server";
import { getCentrosAcopio } from "@/lib/data";

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
  const estadoId = searchParams.get("estado_id") ?? undefined;
  const municipioId = searchParams.get("municipio_id") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  try {
    const centros = await getCentrosAcopio({ estadoId, municipioId, q });

    // Strip private contact fields before exposing publicly
    const data = centros.map(({ responsable_nombre, responsable_telefono, ...pub }) => pub);

    return NextResponse.json(
      { ok: true, data, count: data.length, timestamp: new Date().toISOString() },
      { headers: { ...CORS, ...CACHE } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error al obtener centros de acopio" },
      { status: 500, headers: CORS },
    );
  }
}
