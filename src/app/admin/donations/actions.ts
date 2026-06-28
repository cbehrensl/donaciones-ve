"use server";

import { requireSupabaseServiceClient, createSupabaseClient } from "@/lib/supabase";
import { DonationLink } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getActiveDonationLinks(): Promise<DonationLink[]> {
  // Use public client since this is for public view
  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("donation_links")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active donation links:", error);
    return [];
  }

  return data as DonationLink[];
}

export async function getAllDonationLinks(): Promise<DonationLink[]> {
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

export async function toggleDonationLinkStatus(id: string, currentStatus: boolean) {
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
  revalidatePath("/admin/donations");
}

export async function saveDonationLink(formData: FormData) {
  const supabase = requireSupabaseServiceClient();
  
  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  const image_url = formData.get("image_url") as string | null;
  const is_active = formData.get("is_active") === "on";

  const payload = {
    title,
    description,
    url,
    image_url: image_url ? image_url : null,
    is_active
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
  revalidatePath("/admin/donations");
}

export async function deleteDonationLink(id: string) {
  const supabase = requireSupabaseServiceClient();

  const { error } = await supabase
    .from("donation_links")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("Error eliminando link");
  }

  revalidatePath("/");
  revalidatePath("/admin/donations");
}
