import Link from "next/link";

interface ModeracionPageHeaderProps {
  token: string;
  isAuthorized: boolean;
}

export function ModeracionPageHeader({
  token,
  isAuthorized,
}: ModeracionPageHeaderProps) {
  const donacionesHref = `/staff/donaciones?${new URLSearchParams({ token }).toString()}`;

  return (
    <header className="mb-4 border-b border-zinc-200 pb-4">
      <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
        Moderación
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Revisa centros y refugios. Publica avisos claros para orientar a quien
        quiere ayudar.
      </p>
      {isAuthorized ? (
        <details className="mt-3 sm:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-blue-800">
            Más opciones
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/" className="cta-secondary text-sm font-semibold">
              Vista pública
            </Link>
            <Link href={donacionesHref} className="cta-secondary text-sm font-semibold">
              Links de ayuda
            </Link>
          </div>
        </details>
      ) : null}
      {isAuthorized ? (
        <div className="mt-3 hidden gap-3 sm:flex">
          <Link href="/" className="cta-secondary inline-block text-sm font-semibold">
            Vista pública
          </Link>
          <Link
            href={donacionesHref}
            className="cta-secondary inline-block text-sm font-semibold"
          >
            Links de ayuda
          </Link>
        </div>
      ) : null}
    </header>
  );
}
