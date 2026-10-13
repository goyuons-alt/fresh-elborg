import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/products";
import { useI18n } from "@/lib/i18n";

export function CategoryBar({ active }: { active?: string }) {
  const { lang } = useI18n();
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          to="/category/$slug"
          params={{ slug: c.slug }}
          className={`group flex min-w-[96px] flex-col items-center gap-2 rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:border-primary ${
            active === c.slug ? "border-primary bg-accent" : "border-border bg-card"
          }`}
        >
          <img src={c.img} alt="" width={64} height={64} loading="lazy" className="h-16 w-16 rounded-xl object-cover transition group-hover:scale-105" />
          <span className="whitespace-nowrap text-xs font-semibold text-foreground">{c[lang]}</span>
        </Link>
      ))}
    </div>
  );
}
