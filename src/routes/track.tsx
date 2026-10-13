import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Key } from "@/lib/i18n";

const STEPS = ["new", "preparing", "on_way", "delivered"] as const;

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { code?: string | undefined } => ({ code: typeof s["code"] === "string" ? (s["code"] as string) : undefined }),
  head: () => ({
    meta: [
      { title: "تتبع الطلب | فريش البرج" },
      { name: "description", content: "تابع حالة طلبك من فريش البرج لحظة بلحظة." },
      { property: "og:title", content: "تتبع الطلب | فريش البرج" },
      { property: "og:description", content: "تابع حالة طلبك من فريش البرج لحظة بلحظة." },
    ],
  }),
  component: Track,
});

type Order = { code: string; status: string; driver: string | null };

function Track() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const [code, setCode] = useState(search.code ?? "");
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  const lookup = async (c: string) => {
    const { data } = await supabase.rpc("track_order", { _code: c.trim() });
    setOrder((data as Order[] | null)?.[0] ?? null);
  };
  useEffect(() => { if (search.code) lookup(search.code); }, [search.code]);

  const idx = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); lookup(code); }} className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("enterCode")} className="h-11 flex-1 rounded-full border border-border bg-card px-4 uppercase outline-none focus:border-primary" />
        <button className="rounded-full bg-gradient-primary px-6 font-semibold text-primary-foreground">{t("trackBtn")}</button>
      </form>
      {order === null && <p className="text-muted-foreground">{t("notFound")}</p>}
      {order && (
        <div className="space-y-4 rounded-3xl bg-card p-5 shadow-card">
          <iframe title="map" className="h-64 w-full rounded-2xl border-0" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=31.20%2C30.02%2C31.28%2C30.08&layer=mapnik&marker=30.05%2C31.24" />
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${((Math.max(idx, 0) + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="grid grid-cols-4 text-center text-xs">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= idx ? "font-semibold text-primary" : "text-muted-foreground"}>{t(`st_${s}` as Key)}</span>
            ))}
          </div>
          {order.status === "cancelled" && <p className="text-destructive">{t("st_cancelled")}</p>}
          {order.driver && <p className="text-sm">{t("driver")}: <b>{order.driver}</b></p>}
        </div>
      )}
    </div>
  );
}
