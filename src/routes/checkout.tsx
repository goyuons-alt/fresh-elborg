import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب | فريش البرج" },
      { name: "description", content: "أكمل طلبك من فريش البرج." },
      { property: "og:title", content: "إتمام الطلب | فريش البرج" },
      { property: "og:description", content: "أكمل طلبك من فريش البرج." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, total, clear } = useCart();
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", address: "", pay: "cod" });
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (code)
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-3xl bg-card p-8 text-center shadow-card">
        <h1 className="text-2xl font-bold">{t("orderPlaced")}</h1>
        <p>{t("orderCode")}: <span className="font-mono text-2xl font-bold text-primary">{code}</span></p>
        <Link to="/track" search={{ code }} className="inline-block rounded-full bg-gradient-primary px-6 py-2.5 font-semibold text-primary-foreground">{t("track")}</Link>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { data, error } = await supabase.rpc("place_order", {
      _name: form.name, _phone: form.phone, _address: form.address, _payment: form.pay,
      _items: items.map((i) => ({ id: i.id, qty: i.qty, name: i.product.name, price: i.product.price })),
    });
    setBusy(false);
    if (error) return setErr(error.message);
    clear();
    setCode(data as string);
  };

  const input = "h-11 w-full rounded-xl border border-border bg-card px-3 outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-3 rounded-3xl bg-card p-6 shadow-card">
      <h1 className="text-xl font-bold">{t("checkout")}</h1>
      <input required minLength={2} placeholder={t("name")} className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required minLength={6} placeholder={t("phone")} className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input required minLength={4} placeholder={t("address")} className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <p className="pt-2 text-sm font-semibold">{t("payment")}</p>
      {(["cod", "card"] as const).map((p) => (
        <label key={p} className="flex items-center gap-2 text-sm">
          <input type="radio" checked={form.pay === p} onChange={() => setForm({ ...form, pay: p })} /> {t(p)}
        </label>
      ))}
      <div className="flex justify-between pt-2 font-bold"><span>{t("total")}</span><span className="text-primary">{formatPrice(total, lang)}</span></div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button disabled={busy || items.length === 0} className="w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">{t("placeOrder")}</button>
    </form>
  );
}
