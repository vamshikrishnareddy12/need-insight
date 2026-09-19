import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import type { Service } from "@/lib/services.functions";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/save-button";

export function pricingLabel(service: Service) {
  const map: Record<string, string> = {
    free: "Free",
    freemium: "Freemium",
    paid: "Paid",
    subscription: "Subscription",
    usage_based: "Usage based",
    commission: "Commission",
    unknown: "Pricing varies",
  };
  return map[service.pricing_type] ?? service.pricing_type;
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <Link
          to="/services/$slug"
          params={{ slug: service.slug }}
          className="font-display text-lg font-semibold leading-tight hover:underline"
        >
          {service.name}
        </Link>
        <SaveButton serviceId={service.id} />
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{pricingLabel(service)}</Badge>
        {service.has_free_plan && <Badge variant="outline">Free plan</Badge>}
        {service.has_free_trial && <Badge variant="outline">Free trial</Badge>}
        {service.subcategory && <Badge variant="outline">{service.subcategory}</Badge>}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-border/70 pt-3 text-sm">
        <Link
          to="/services/$slug"
          params={{ slug: service.slug }}
          className="font-medium text-primary hover:underline"
        >
          Details
        </Link>
        <a
          href={service.official_url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          Website <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
