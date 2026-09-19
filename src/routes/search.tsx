import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { listCategories, searchServices, type SearchInput } from "@/lib/services.functions";
import { Page } from "@/components/site-layout";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "all").default("all"),
  pricing: fallback(z.string(), "all").default("all"),
  platform: fallback(z.string(), "all").default("all"),
  freePlan: fallback(z.boolean(), false).default(false),
  freeTrial: fallback(z.boolean(), false).default(false),
  sort: fallback(z.string(), "relevance").default("relevance"),
});

const resultsQuery = (input: SearchInput) =>
  queryOptions({
    queryKey: ["search", input],
    queryFn: () => searchServices({ data: input }),
  });

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(resultsQuery(deps)),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Search services — ServiceFinder" },
      {
        name: "description",
        content: "Search services and tools by need, then filter by pricing, platform and category.",
      },
      { property: "og:title", content: "Search services — ServiceFinder" },
      {
        property: "og:description",
        content: "Filter real services by pricing model, platform and category.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
  errorComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">
        Search is unavailable right now. Please try again.
      </p>
    </Page>
  ),
  notFoundComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center">Nothing here.</p>
    </Page>
  ),
});

const PRICING = ["free", "freemium", "paid", "subscription", "usage_based", "commission"];
const PLATFORMS = ["web", "ios", "android", "windows", "macos", "linux", "api"];

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { data: results } = useSuspenseQuery(resultsQuery(search));
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [term, setTerm] = useState(search.q);
  const [compare, setCompare] = useState<string[]>([]);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const activeFilters =
    (search.category !== "all" ? 1 : 0) +
    (search.pricing !== "all" ? 1 : 0) +
    (search.platform !== "all" ? 1 : 0) +
    (search.freePlan ? 1 : 0) +
    (search.freeTrial ? 1 : 0);

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: term });
          }}
        >
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="What do you need?"
            className="h-12 rounded-full pl-11 pr-28"
          />
          <Button type="submit" className="absolute right-2 top-1.5 h-9 rounded-full">
            Search
          </Button>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold">Filters</h2>
              {activeFilters > 0 && (
                <button
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    update({
                      category: "all",
                      pricing: "all",
                      platform: "all",
                      freePlan: false,
                      freeTrial: false,
                    })
                  }
                >
                  <X className="size-3" /> Clear ({activeFilters})
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={search.category} onValueChange={(v) => update({ category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pricing</Label>
              <Select value={search.pricing} onValueChange={(v) => update({ pricing: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any pricing</SelectItem>
                  {PRICING.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={search.platform} onValueChange={(v) => update({ platform: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any platform</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="freePlan"
                  checked={search.freePlan}
                  onCheckedChange={(v) => update({ freePlan: v === true })}
                />
                <Label htmlFor="freePlan">Has a free plan</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="freeTrial"
                  checked={search.freeTrial}
                  onCheckedChange={(v) => update({ freeTrial: v === true })}
                />
                <Label htmlFor="freeTrial">Has a free trial</Label>
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "result" : "results"}
                {search.q ? ` for “${search.q}”` : ""}
              </p>
              <div className="flex items-center gap-2">
                <Select value={search.sort} onValueChange={(v) => update({ sort: v })}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort: relevance</SelectItem>
                    <SelectItem value="name">Sort: name A–Z</SelectItem>
                    <SelectItem value="newest">Sort: newest founded</SelectItem>
                  </SelectContent>
                </Select>
                {compare.length > 0 && (
                  <Button asChild size="sm">
                    <Link to="/compare" search={{ slugs: compare.join(",") }}>
                      Compare ({compare.length})
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
                <p className="font-medium">No services matched.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try fewer filters or a broader term — or{" "}
                  <Link to="/submit" className="text-primary hover:underline">
                    suggest a service
                  </Link>{" "}
                  we're missing.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((s) => (
                  <div key={s.id} className="space-y-2">
                    <ServiceCard service={s} />
                    <label className="flex cursor-pointer items-center gap-2 pl-1 text-xs text-muted-foreground">
                      <Checkbox
                        checked={compare.includes(s.slug)}
                        onCheckedChange={(v) =>
                          setCompare((prev) =>
                            v === true
                              ? [...prev, s.slug].slice(0, 4)
                              : prev.filter((x) => x !== s.slug),
                          )
                        }
                      />
                      Add to compare
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
