import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCategoryWithServices } from "@/lib/services.functions";
import { Page } from "@/components/site-layout";
import { ServiceCard } from "@/components/service-card";

const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const data = await getCategoryWithServices({ data: { slug } });
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(categoryQuery(params.slug)),
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} services — ServiceFinder` },
        {
          name: "description",
          content: `Compare ${name} services and platforms: pricing models, platforms, features and who each one is best for.`,
        },
        { property: "og:title", content: `${name} services — ServiceFinder` },
        {
          property: "og:description",
          content: `Real ${name} services and platforms, compared neutrally.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: () => (
    <Page>
      <p className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">
        This category couldn't load. Please refresh.
      </p>
    </Page>
  ),
  notFoundComponent: () => (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="font-medium">Category not found.</p>
        <Link to="/categories" className="mt-2 inline-block text-primary hover:underline">
          Browse all categories
        </Link>
      </div>
    </Page>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(categoryQuery(slug));

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
          ← All categories
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold">{data.category.name}</h1>
        {data.category.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{data.category.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{data.services.length} services listed</p>

        {data.services.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Nothing listed here yet.{" "}
            <Link to="/submit" className="text-primary hover:underline">
              Suggest a service
            </Link>
            .
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
