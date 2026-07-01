"use server";

import { requireSupabaseServiceClient, createSupabaseClient } from "@/lib/supabase";
import { normalizeWhatsappNumber } from "@/lib/contact-links";
import type { DonationLink, DonationLinkCategory } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { isModeratorTokenValid } from "@/lib/moderacion-auth";

export interface DonationAdminData {
  total: number;
  active: number;
  money: number;
  psychological: number;
}

const DONATION_LINK_CATEGORIES: DonationLinkCategory[] = ["money", "psychological"];

function normalizeDonationCategory(value: FormDataEntryValue | null): DonationLinkCategory {
  return DONATION_LINK_CATEGORIES.includes(value as DonationLinkCategory)
    ? (value as DonationLinkCategory)
    : "money";
}

function normalizeOptionalUrl(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  return raw ? raw : null;
}

function normalizeWhatsappPhone(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const normalized = normalizeWhatsappNumber(raw);
  if (!normalized) return null;
  return `+${normalized}`;
}

function assertModeratorToken(token: string): void {
  if (!isModeratorTokenValid(token)) {
    throw new Error("No autorizado");
  }
}

export async function getActiveDonationLinks(
  category: DonationLinkCategory = "money",
): Promise<DonationLink[]> {
  // Use public client since this is for public view
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("donation_links")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active donation links:", error);
    return [];
  }

  return data as DonationLink[];
}

export async function getAllDonationLinks(token: string): Promise<DonationLink[]> {
  assertModeratorToken(token);
  const supabase = requireSupabaseServiceClient();

  const { data, error } = await supabase
    .from("donation_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all donation links:", error);
    throw new Error("No se pudieron obtener los links de donación");
  }

  return data as DonationLink[];
}

export async function getDonationAdminData(
  token: string,
): Promise<DonationAdminData> {
  assertModeratorToken(token);
  const links = await getAllDonationLinks(token);

  return {
    total: links.length,
    active: links.filter((link) => link.is_active).length,
    money: links.filter((link) => link.category === "money").length,
    psychological: links.filter((link) => link.category === "psychological").length,
  };
}

export async function toggleDonationLinkStatus(
  id: string,
  currentStatus: boolean,
  token: string,
) {
  assertModeratorToken(token);
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase
    .from("donation_links")
    .update({ is_active: !currentStatus })
    .eq("id", id);

  if (error) {
    console.error("Error toggling status:", error);
    throw new Error("No se pudo actualizar el estado");
  }

  revalidatePath("/");
  revalidatePath("/staff/donaciones");
}

export async function saveDonationLink(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  assertModeratorToken(token);
  const supabase = requireSupabaseServiceClient();
  
  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = normalizeOptionalUrl(formData.get("url"));
  const whatsapp_phone = normalizeWhatsappPhone(formData.get("whatsapp_phone"));
  const image_url = formData.get("image_url") as string | null;
  const country = (formData.get("country") as string | null)?.toUpperCase() || null;
  const category = normalizeDonationCategory(formData.get("category"));
  const is_active = formData.get("is_active") === "on";

  if (!url && !whatsapp_phone) {
    throw new Error("Agrega una URL o un número de WhatsApp");
  }

  const payload = {
    title,
    description,
    url,
    whatsapp_phone,
    image_url: image_url ? image_url : null,
    country,
    category,
    is_active,
  };

  if (id) {
    // Update existing
    const { error } = await supabase
      .from("donation_links")
      .update(payload)
      .eq("id", id);

    if (error) throw new Error("Error actualizando link");
  } else {
    // Insert new
    const { error } = await supabase
      .from("donation_links")
      .insert([payload]);

    if (error) throw new Error("Error creando link");
  }

  revalidatePath("/");
  revalidatePath("/staff/donaciones");
}

export async function deleteDonationLink(id: string, token: string) {
  assertModeratorToken(token);
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase
    .from("donation_links")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("Error eliminando link");
  }

  revalidatePath("/");
  revalidatePath("/staff/donaciones");
}
