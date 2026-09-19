import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { getHomeData } from "@/lib/services.functions";
import { Page } from "@/components/site-layout";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHomeData(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServiceFinder — Find the right service or tool" },
      {
        name: "description",
        content:
          "Describe what you need and discover real services, apps and platforms that do it. Compare pricing, platforms and features side by side.",
      },
      { property: "og:title", content: "ServiceFinder — Find the right service or tool" },
      {
        property: "og:description",
        content: "Search a need, discover the platforms that serve it, and compare them neutrally.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
  errorComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">
        We couldn't load the directory. Please refresh.
      </p>
    </Page>
  ),
});

const POPULAR = [
  "grocery delivery",
  "website builder",
  "video editing",
  "food delivery",
  "project management",
  "online courses",
];

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  return (
    <Page>
      <section className="border-b border-border/70 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            What do you need to get done?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Search a need — not a brand. ServiceFinder lists {data.total} real services, apps and
            platforms across {data.categories.length} categories.
          </p>

          <form
            className="relative mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/search", search: { q: term } });
            }}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. grocery delivery, website builder, invoicing"
              className="h-14 rounded-full pl-12 pr-32 text-base"
            />
            <Button type="submit" className="absolute right-2 top-2 h-10 rounded-full px-5">
              Search
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {POPULAR.map((p) => (
              <Link
                key={p}
                to="/search"
                search={{ q: p }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Browse by category</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline">
            All categories
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.categories.map((c) => (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.name}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="font-display text-2xl font-bold">Recently listed</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.featured.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>
    </Page>
  );
}
