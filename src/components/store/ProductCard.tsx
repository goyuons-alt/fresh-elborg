import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice, productImage, type Product } from "@/lib/products";

export function ProductCard({ p, rank }: { p: Product; rank?: number }) {
  const { add } = useCart();
  const { t, lang } = useI18n();
  const [done, setDone] = useState(false);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={productImage(p)} alt={p.name} width={400} height={400} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {rank && (
          <span className="absolute top-2 start-2 grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">#{rank}</span>
        )}
        {p.old_price && (
          <span className="absolute top-2 end-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
            -{Math.round((1 - p.price / p.old_price) * 100)}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">{lang === "en" && p.name_en ? p.name_en : p.name}</h3>
        <p className="text-xs text-muted-foreground">{p.weight}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-base font-bold text-foreground">{formatPrice(p.price, lang)}</p>
            {p.old_price && <p className="text-xs text-muted-foreground line-through">{formatPrice(p.old_price, lang)}</p>}
          </div>
          <button
            onClick={() => {
              add(p);
              setDone(true);
              setTimeout(() => setDone(false), 1200);
            }}
            aria-label={t("addToCart")}
            className={`grid h-10 w-10 place-items-center rounded-full text-primary-foreground transition active:scale-90 ${done ? "bg-success" : "bg-gradient-primary shadow-glow hover:scale-110"}`}
          >
            {done ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
