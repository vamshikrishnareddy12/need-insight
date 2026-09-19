import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bookmark, Compass, LogOut, Menu, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="size-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">ServiceFinder</span>
        </Link>

        <form
          className="relative hidden flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search", search: { q: term } });
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search grocery delivery, website builders…"
            className="pl-9"
          />
        </form>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/categories">Categories</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/compare" search={{ slugs: "" }}>
              Compare
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/saved">
              <Bookmark className="size-4" /> Saved
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/submit">
              <Plus className="size-4" /> Submit
            </Link>
          </Button>
          {email ? (
            <Button variant="ghost" size="sm" onClick={signOut} title={email}>
              <LogOut className="size-4" /> Sign out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-border/70 px-4 py-3 md:hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              navigate({ to: "/search", search: { q: term } });
            }}
          >
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search services…"
            />
          </form>
          <div className="grid gap-1 text-sm">
            <Link to="/categories" onClick={() => setOpen(false)} className="py-1.5">
              Categories
            </Link>
            <Link
              to="/compare"
              search={{ slugs: "" }}
              onClick={() => setOpen(false)}
              className="py-1.5"
            >
              Compare
            </Link>
            <Link to="/saved" onClick={() => setOpen(false)} className="py-1.5">
              Saved
            </Link>
            <Link to="/submit" onClick={() => setOpen(false)} className="py-1.5">
              Submit a service
            </Link>
            {email ? (
              <button className="py-1.5 text-left" onClick={signOut}>
                Sign out
              </button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-1.5">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          ServiceFinder — a neutral directory of real services and tools. We do not rank by
          payment.
        </p>
        <div className="flex gap-4">
          <Link to="/categories">Categories</Link>
          <Link to="/submit">Submit a service</Link>
        </div>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
