import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatPrice, productImage, productsQuery } from "@/lib/products";

export function SearchBar() {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const { data = [] } = useQuery(productsQuery);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const blurT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return data.filter((p) => p.name.toLowerCase().includes(s) || (p.name_en ?? "").toLowerCase().includes(s)).slice(0, 6);
  }, [q, data]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => (blurT.current = setTimeout(() => setFocus(false), 150))}
        placeholder={t("search")}
        className="h-11 w-full rounded-full border border-border bg-card ps-10 pe-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {focus && q.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-card">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{t("noResults")}</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  add(p);
                  setQ("");
                }}
                className="flex w-full items-center gap-3 p-3 text-start transition hover:bg-accent"
              >
                <img src={productImage(p)} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                <span className="flex-1 text-sm text-foreground">
                  {lang === "en" && p.name_en ? p.name_en : p.name}
                  <span className="block text-xs text-muted-foreground">{p.weight}</span>
                </span>
                <span className="text-sm font-bold text-primary">{formatPrice(p.price, lang)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
