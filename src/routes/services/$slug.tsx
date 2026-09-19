import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, ExternalLink, Minus } from "lucide-react";
import { getServiceBySlug } from "@/lib/services.functions";
import { Page } from "@/components/site-layout";
import { ServiceCard, pricingLabel } from "@/components/service-card";
import { SaveButton } from "@/components/save-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const data = await getServiceBySlug({ data: { slug } });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/services/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(serviceQuery(params.slug)),
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — pricing, features and alternatives | ServiceFinder` },
        {
          name: "description",
          content: `What ${name} does, how it charges, which platforms it supports, and similar services worth comparing.`,
        },
        { property: "og:title", content: `${name} — pricing, features and alternatives` },
        {
          property: "og:description",
          content: `Factual overview of ${name}: pricing model, platforms, features and alternatives.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ServicePage,
  errorComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">
        This service couldn't load. Please refresh.
      </p>
    </Page>
  ),
  notFoundComponent: () => (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="font-medium">Service not found.</p>
        <Link to="/categories" className="mt-2 inline-block text-primary hover:underline">
          Browse categories
        </Link>
      </div>
    </Page>
  ),
});

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(serviceQuery(slug));
  const { service, category, related } = data;

  const facts: [string, string][] = [
    ["Pricing model", pricingLabel(service)],
    ["Price details", service.price_description ?? "Not published"],
    ["Free plan", service.has_free_plan === null ? "Unknown" : service.has_free_plan ? "Yes" : "No"],
    [
      "Free trial",
      service.has_free_trial === null ? "Unknown" : service.has_free_trial ? "Yes" : "No",
    ],
    ["Platforms", service.platforms.length ? service.platforms.join(", ") : "Not listed"],
    ["Availability", service.availability ?? "Not listed"],
    ["Founded", service.founded_year ? String(service.founded_year) : "Not listed"],
  ];

  return (
    <Page>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {category && (
              <Link
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← {category.name}
              </Link>
            )}
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{service.name}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{service.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{pricingLabel(service)}</Badge>
              {service.subcategory && <Badge variant="outline">{service.subcategory}</Badge>}
              {service.tags.slice(0, 5).map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton serviceId={service.id} />
            <Button asChild variant="outline">
              <Link to="/compare" search={{ slugs: service.slug }}>
                Compare
              </Link>
            </Button>
            <Button asChild>
              <a href={service.official_url} target="_blank" rel="noreferrer noopener">
                Visit site <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        {service.long_description && (
          <p className="mt-8 max-w-3xl leading-relaxed text-foreground/90">
            {service.long_description}
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="space-y-8">
            <List title="Key features" items={service.features} />
            <List title="Best for" items={service.best_for} />
            <div className="grid gap-8 sm:grid-cols-2">
              {service.pros.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold">Strengths</h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {service.pros.map((p) => (
                      <li key={p} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {service.cons.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold">Limitations</h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {service.cons.map((c) => (
                      <li key={c} className="flex gap-2">
                        <Minus className="mt-0.5 size-4 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold">At a glance</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold">Similar services</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
            <Button asChild variant="outline" className="mt-6">
              <Link
                to="/compare"
                search={{ slugs: [service.slug, ...related.slice(0, 2).map((r) => r.slug)].join(",") }}
              >
                Compare {service.name} with similar services
              </Link>
            </Button>
          </section>
        )}
      </div>
    </Page>
  );
}
