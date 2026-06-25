interface ModeracionFormContextProps {
  token: string;
  q: string;
  estatus: string;
  verificacion: string;
  page: number;
}

export function ModeracionFormContext({
  token,
  q,
  estatus,
  verificacion,
  page,
}: ModeracionFormContextProps) {
  return (
    <>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="q" value={q} />
      <input type="hidden" name="estatus" value={estatus} />
      <input type="hidden" name="verificacion" value={verificacion} />
      <input type="hidden" name="page" value={String(page)} />
    </>
  );
}
