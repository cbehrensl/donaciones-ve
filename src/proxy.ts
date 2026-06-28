import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  // Solo continuar si tenemos las variables de entorno de Supabase
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  
  // Capturar headers geográficos (inyectados por Vercel en producción)
  const city = request.headers.get('x-vercel-ip-city') || 'Desconocido';
  const region = request.headers.get('x-vercel-ip-country-region') || 'Desconocido';
  const country = request.headers.get('x-vercel-ip-country') || 'Desconocido';
  
  // Detectar si es móvil basado en headers estándar y de Vercel
  const userAgent = request.headers.get('user-agent') || '';
  const isMobileHeader = request.headers.get('sec-ch-ua-mobile') === '?1';
  const isMobileUserAgent = /Mobile|Android|iP(hone|od|ad)/i.test(userAgent);
  const isMobile = isMobileHeader || isMobileUserAgent;

  // Registrar asíncronamente para no bloquear la petición
  // En Next.js middleware no podemos usar waitUntil directamente sin edge functions especiales,
  // pero el fetch se enviará. Para producción más pesada se usaría waitUntil o un API route.
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Ignoramos el await para no añadir latencia a cada request
    supabase.from('page_views').insert({
      path: pathname,
      city,
      region,
      country,
      is_mobile: isMobile
    }).then(({ error }) => {
      if (error) console.error('Error insertando page view:', error);
    });
  } catch (err) {
    console.error('Error en middleware tracking:', err);
  }

  return NextResponse.next();
}

export const config = {
  // Coincide con las rutas que quieres medir (ej. home, centros/nuevo, etc)
  matcher: [
    '/',
    '/centros/nuevo',
    '/gestion/:path*'
  ],
};
