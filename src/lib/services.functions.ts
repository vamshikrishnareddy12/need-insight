import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export type SearchInput = {
  q?: string;
  category?: string;
  pricing?: string;
  platform?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  sort?: string;
};

export const searchServices = createServerFn({ method: "GET" })
  .inputValidator((input: SearchInput | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const q = (data.q ?? "").trim();
    const { data: rows, error } = await supabase.rpc("search_services", {
      q,
      category_slug: data.category && data.category !== "all" ? data.category : undefined,
    });
    if (error) throw new Error(error.message);

    let results = (rows ?? []) as Service[];
    if (data.pricing && data.pricing !== "all") {
      results = results.filter((s) => s.pricing_type === data.pricing);
    }
    if (data.platform && data.platform !== "all") {
      results = results.filter((s) => s.platforms.includes(data.platform!));
    }
    if (data.freePlan) results = results.filter((s) => s.has_free_plan === true);
    if (data.freeTrial) results = results.filter((s) => s.has_free_trial === true);

    if (data.sort === "name") {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    } else if (data.sort === "newest") {
      results = [...results].sort(
        (a, b) => (b.founded_year ?? 0) - (a.founded_year ?? 0),
      );
    }

    if (q) {
      await supabase.from("analytics_events").insert({ event_type: "search", query: q });
    }

    return results;
  });

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: service, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!service) return null;

    let category: Category | null = null;
    if (service.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("id", service.category_id)
        .maybeSingle();
      category = cat ?? null;
    }

    const { data: related } = await supabase
      .from("services")
      .select("*")
      .eq("status", "published")
      .eq("category_id", service.category_id ?? "")
      .neq("id", service.id)
      .limit(4);

    await supabase
      .from("analytics_events")
      .insert({ event_type: "service_view", service_id: service.id });

    return { service, category, related: (related ?? []) as Service[] };
  });

export const getServicesBySlugs = createServerFn({ method: "GET" })
  .inputValidator((input: { slugs: string[] }) => input)
  .handler(async ({ data }) => {
    if (!data.slugs.length) return { services: [] as Service[], categories: [] as Category[] };
    const supabase = publicClient();
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .in("slug", data.slugs)
      .eq("status", "published");
    if (error) throw new Error(error.message);
    const { data: categories } = await supabase.from("categories").select("*");
    return { services: (services ?? []) as Service[], categories: (categories ?? []) as Category[] };
  });

export const getCategoryWithServices = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!category) return null;
    const { data: services } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", category.id)
      .eq("status", "published")
      .order("name");
    return { category, services: (services ?? []) as Service[] };
  });

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [{ data: categories }, { data: services }, { count }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("services").select("*").eq("status", "published").order("name").limit(8),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);
  return {
    categories: (categories ?? []) as Category[],
    featured: (services ?? []) as Service[],
    total: count ?? 0,
  };
});

export const submitService = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      name: string;
      official_url: string;
      description: string;
      category_slug?: string;
      contact_email?: string;
      notes?: string;
    }) => {
      if (!input.name?.trim()) throw new Error("Name is required");
      if (!input.official_url?.trim()) throw new Error("Website is required");
      if (!input.description?.trim()) throw new Error("Description is required");
      return input;
    },
  )
  .handler(async ({ data }) => {
    const { error } = await publicClient()
      .from("service_submissions")
      .insert({
        name: data.name.trim(),
        official_url: data.official_url.trim(),
        description: data.description.trim(),
        category_slug: data.category_slug || null,
        contact_email: data.contact_email || null,
        notes: data.notes || null,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
