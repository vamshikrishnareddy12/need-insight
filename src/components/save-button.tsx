import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveButton({ serviceId }: { serviceId: string }) {
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) return setSaved(false);
      const { data: row } = await supabase
        .from("saved_services")
        .select("id")
        .eq("service_id", serviceId)
        .maybeSingle();
      if (active) setSaved(!!row);
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [serviceId]);

  async function toggle() {
    if (!userId) {
      toast.info("Sign in to save services to your list.");
      return;
    }
    setBusy(true);
    if (saved) {
      const { error } = await supabase
        .from("saved_services")
        .delete()
        .eq("service_id", serviceId)
        .eq("user_id", userId);
      if (error) toast.error(error.message);
      else {
        setSaved(false);
        toast.success("Removed from saved");
      }
    } else {
      const { error } = await supabase
        .from("saved_services")
        .insert({ service_id: serviceId, user_id: userId });
      if (error) toast.error(error.message);
      else {
        setSaved(true);
        toast.success("Saved");
      }
    }
    setBusy(false);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={busy}
      onClick={toggle}
      aria-label={saved ? "Remove from saved" : "Save service"}
      className="shrink-0"
    >
      <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
    </Button>
  );
}
