export function normalizeWhatsappNumber(phone: string): string {
  const cleaned = phone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned.slice(1);
  }

  const digits = cleaned.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.startsWith("04")) {
    return `58${digits.slice(1)}`;
  }

  if (digits.startsWith("4")) {
    return `58${digits}`;
  }

  return digits;
}

export function formatWhatsappHref(phone: string): string {
  return `https://wa.me/${normalizeWhatsappNumber(phone)}`;
}
