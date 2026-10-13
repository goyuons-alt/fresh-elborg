import { Link } from "@tanstack/react-router";
import { MapPin, ShoppingBag, Snowflake } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { SearchBar } from "./SearchBar";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Snowflake className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">{t("brand")}</span>
        </Link>
        <div className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs md:flex">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">{t("deliverTo")}</span>
          <span className="font-medium text-foreground">{t("location")}</span>
        </div>
        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>
        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label={t("cart")}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition hover:scale-105"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
