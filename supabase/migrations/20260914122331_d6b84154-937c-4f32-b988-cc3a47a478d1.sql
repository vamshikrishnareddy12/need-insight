-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  long_description text,
  logo_url text,
  official_url text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory text,
  pricing_type text NOT NULL DEFAULT 'unknown',
  price_description text,
  has_free_plan boolean,
  has_free_trial boolean,
  platforms text[] NOT NULL DEFAULT '{}',
  availability text,
  founded_year int,
  features text[] NOT NULL DEFAULT '{}',
  best_for text[] NOT NULL DEFAULT '{}',
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published services are public" ON public.services FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all services" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX services_category_idx ON public.services (category_id);
CREATE INDEX services_tags_idx ON public.services USING gin (tags);

-- saved services
CREATE TABLE public.saved_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, service_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_services TO authenticated;
GRANT ALL ON public.saved_services TO service_role;
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved services" ON public.saved_services FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- submissions
CREATE TABLE public.service_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  official_url text NOT NULL,
  category_slug text,
  description text NOT NULL,
  contact_email text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.service_submissions TO authenticated;
GRANT ALL ON public.service_submissions TO service_role;
ALTER TABLE public.service_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit" ON public.service_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read submissions" ON public.service_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update submissions" ON public.service_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- analytics
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  query text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read events" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- relevance ranked search
CREATE OR REPLACE FUNCTION public.search_services(q text, category_slug text DEFAULT NULL)
RETURNS SETOF public.services
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH needle AS (SELECT lower(trim(coalesce(q, ''))) AS n)
  SELECT s.* FROM public.services s
  LEFT JOIN public.categories c ON c.id = s.category_id
  CROSS JOIN needle
  WHERE s.status = 'published'
    AND (category_slug IS NULL OR c.slug = category_slug)
    AND (
      needle.n = '' OR
      lower(s.name) LIKE '%' || needle.n || '%' OR
      lower(coalesce(c.name, '')) LIKE '%' || needle.n || '%' OR
      lower(coalesce(s.subcategory, '')) LIKE '%' || needle.n || '%' OR
      EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE lower(t) LIKE '%' || needle.n || '%') OR
      EXISTS (SELECT 1 FROM unnest(s.features) f WHERE lower(f) LIKE '%' || needle.n || '%') OR
      EXISTS (SELECT 1 FROM unnest(s.best_for) b WHERE lower(b) LIKE '%' || needle.n || '%') OR
      lower(s.description) LIKE '%' || needle.n || '%' OR
      lower(coalesce(s.long_description, '')) LIKE '%' || needle.n || '%' OR
      EXISTS (
        SELECT 1 FROM unnest(string_to_array(needle.n, ' ')) w
        WHERE length(w) > 2 AND (
          lower(s.name) LIKE '%' || w || '%' OR
          lower(coalesce(c.name, '')) LIKE '%' || w || '%' OR
          lower(coalesce(s.subcategory, '')) LIKE '%' || w || '%' OR
          EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE lower(t) LIKE '%' || w || '%') OR
          EXISTS (SELECT 1 FROM unnest(s.features) f WHERE lower(f) LIKE '%' || w || '%') OR
          lower(s.description) LIKE '%' || w || '%'
        )
      )
    )
  ORDER BY (
    CASE WHEN lower(s.name) = needle.n THEN 0
         WHEN lower(s.name) LIKE needle.n || '%' THEN 1
         WHEN lower(coalesce(c.name, '')) LIKE '%' || needle.n || '%' THEN 2
         WHEN lower(coalesce(s.subcategory, '')) LIKE '%' || needle.n || '%' THEN 3
         WHEN EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE lower(t) LIKE '%' || needle.n || '%') THEN 4
         WHEN EXISTS (SELECT 1 FROM unnest(s.features) f WHERE lower(f) LIKE '%' || needle.n || '%') THEN 5
         WHEN lower(s.name) LIKE '%' || needle.n || '%' THEN 6
         WHEN lower(s.description) LIKE '%' || needle.n || '%' THEN 7
         ELSE 8 END
  ), s.name ASC
$$;
GRANT EXECUTE ON FUNCTION public.search_services(text, text) TO anon, authenticated;