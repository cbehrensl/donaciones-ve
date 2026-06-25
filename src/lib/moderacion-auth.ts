export function getModeratorAccessToken(): string | null {
  return (
    process.env.MODERADOR_ACCESS_TOKEN ??
    process.env.MODERADOR_ACCES_TOKEN ??
    null
  );
}

export function isModeratorTokenValid(token: FormDataEntryValue | string | null): boolean {
  const expected = getModeratorAccessToken();

  if (!expected || typeof token !== "string") {
    return false;
  }

  return token === expected;
}
