import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { formatPrice, productsQuery } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة التحكم | فريش البرج" },
      { name: "description", content: "إدارة المبيعات والأسعار والطلبات." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const STATUSES = ["new", "preparing", "on_way", "delivered", "cancelled"] as const;
const ST_AR: Record<string, string> = { new: "جديد", preparing: "قيد التجهيز", on_way: "في الطريق", delivered: "تم التوصيل", cancelled: "ملغي" };

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const { lang } = useI18n();
  const [tab, setTab] = useState<"overview" | "prices" | "orders">("overview");

  if (loading) return null;
  if (!user || !isAdmin)
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-card p-6 text-center shadow-card">
        <p className="mb-3">هذه الصفحة خاصة بمدير المتجر فقط.</p>
        <Link to="/account" className="text-primary">تسجيل الدخول</Link>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto">
        {([["overview", "المبيعات"], ["prices", "الأسعار"], ["orders", "الطلبات"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === k ? "bg-secondary text-secondary-foreground" : "bg-card text-foreground"}`}>{l}</button>
        ))}
      </div>
      {tab === "overview" && <Overview lang={lang} />}
      {tab === "prices" && <Prices lang={lang} />}
      {tab === "orders" && <Orders lang={lang} />}
    </div>
  );
}

type Order = { id: string; code: string; customer_name: string; phone: string; address: string; total: number; status: string; driver: string | null; payment_method: string; created_at: string; items: { name: string; qty: number }[] };

const ordersQuery = {
  queryKey: ["admin-orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return (data ?? []) as unknown as Order[];
  },
};

function Overview({ lang }: { lang: "ar" | "en" }) {
  const { data = [] } = useQuery(ordersQuery);
  const today = new Date().toDateString();
  const todays = data.filter((o) => new Date(o.created_at).toDateString() === today && o.status !== "cancelled");
  const chart = useMemo(() => {
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    return days.map((d) => ({
      day: d.toLocaleDateString("ar-EG", { weekday: "short" }),
      total: data.filter((o) => new Date(o.created_at).toDateString() === d.toDateString() && o.status !== "cancelled").reduce((a, o) => a + Number(o.total), 0),
    }));
  }, [data]);
  const stat = (l: string, v: string) => (
    <div className="rounded-2xl bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {stat("مبيعات اليوم", formatPrice(todays.reduce((a, o) => a + Number(o.total), 0), lang))}
        {stat("طلبات جديدة", String(data.filter((o) => o.status === "new").length))}
        {stat("طلبات اليوم", String(todays.length))}
      </div>
      <div className="h-64 rounded-2xl bg-card p-4 shadow-card">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}><XAxis dataKey="day" fontSize={12} /><Tooltip /><Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Prices({ lang }: { lang: "ar" | "en" }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery(productsQuery);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const save = async (id: string) => {
    const price = Number(edits[id]);
    if (!(price > 0)) return;
    const { error } = await supabase.from("products").update({ price }).eq("id", id);
    if (!error) { setEdits(({ [id]: _, ...rest }) => rest); qc.invalidateQueries({ queryKey: ["products"] }); }
    else alert(error.message);
  };
  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج" className="h-11 w-full rounded-full border border-border bg-card px-4" />
      <div className="overflow-hidden rounded-2xl bg-card shadow-card">
        {data.filter((p) => p.name.includes(q)).map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-border p-3 last:border-0">
            <div className="flex-1"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.weight} · {formatPrice(p.price, lang)}</p></div>
            <input type="number" min={1} step="0.5" value={edits[p.id] ?? p.price} onChange={(e) => setEdits({ ...edits, [p.id]: e.target.value })} className="h-9 w-24 rounded-lg border border-border px-2" />
            <button disabled={edits[p.id] === undefined} onClick={() => save(p.id)} className="rounded-full bg-gradient-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">حفظ</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Orders({ lang }: { lang: "ar" | "en" }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery(ordersQuery);
  const update = async (id: string, patch: { status?: string; driver?: string }) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) alert(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };
  if (!data.length) return <p className="text-muted-foreground">لا توجد طلبات بعد.</p>;
  return (
    <div className="space-y-3">
      {data.map((o) => (
        <div key={o.id} className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-bold">#{o.code} · {o.customer_name} · <span dir="ltr">{o.phone}</span></p>
            <p className="font-bold text-primary">{formatPrice(Number(o.total), lang)}</p>
          </div>
          <p className="text-sm text-muted-foreground">{o.address} · {o.payment_method === "cod" ? "كاش" : "بطاقة"}</p>
          <p className="text-xs">{o.items.map((i) => `${i.name} ×${i.qty}`).join(" ، ")}</p>
          <div className="flex flex-wrap gap-2">
            <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })} className="h-9 rounded-lg border border-border bg-card px-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{ST_AR[s]}</option>)}
            </select>
            <input defaultValue={o.driver ?? ""} placeholder="اسم المندوب" onBlur={(e) => e.target.value !== (o.driver ?? "") && update(o.id, { driver: e.target.value })} className="h-9 rounded-lg border border-border px-2 text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
