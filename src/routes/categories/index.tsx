import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { listCategories } from "@/lib/services.functions";
import { Page } from "@/components/site-layout";

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  head: () => ({
    meta: [
      { title: "All categories — ServiceFinder" },
      {
        name: "description",
        content:
          "Browse every category of services and tools on ServiceFinder, from delivery and finance to AI tools and hosting.",
      },
      { property: "og:title", content: "All categories — ServiceFinder" },
      {
        property: "og:description",
        content: "Browse services by category: delivery, finance, AI tools, hosting and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Categories,
  errorComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">
        Categories couldn't load. Please refresh.
      </p>
    </Page>
  ),
  notFoundComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center">Nothing here.</p>
    </Page>
  ),
});

function Categories() {
  const { data } = useSuspenseQuery(categoriesQuery);
  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          {data.length} categories of services, apps and platforms.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">{c.name}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              {c.description && (
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
