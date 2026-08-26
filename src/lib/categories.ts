import { supabase } from "@/integrations/supabase/client";

export type CategoryRow = {
  id: string;
  name: string;
  created_at: string;
};

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("कृपया श्रेणीचे नाव लिहा.");
  const { error } = await supabase.from("categories").insert({ name: trimmed });
  if (error) {
    if (error.code === "23505") throw new Error("ही श्रेणी आधीच आहे.");
    throw error;
  }
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
