import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import hero1 from "@/assets/hero-1.webp";
import hero2 from "@/assets/hero-2.webp";
import { useI18n } from "@/lib/i18n";

const slides = [
  { img: hero1, ar: ["عرض المدارس", "كيلو بيف برجر فريش 20 قطعة بـ 230 ج.م بدلاً من 275"], en: ["Back to School Deal", "1kg Fresh beef burger, 20 pcs — 230 EGP instead of 275"], to: "offers" },
  { img: hero2, ar: ["عرض الشاورما", "400 جرام شاورما دجاج متبلة + عيش سوري بـ 125 ج.م"], en: ["Shawarma Deal", "400g marinated chicken shawarma + Syrian bread — 125 EGP"], to: "offers" },
];

export function HeroSlider() {
  const { lang, t } = useI18n();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative overflow-hidden rounded-3xl bg-secondary shadow-card">
      <div className="relative aspect-[16/9] sm:aspect-[16/6]">
        {slides.map((s, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}>
            <img src={s.img} alt="" width={1600} height={704} fetchPriority={idx === 0 ? "high" : "low"} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent" />
            <div className="absolute bottom-0 start-0 max-w-lg p-5 sm:p-10">
              <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{t("offerBadge")}</span>
              <h2 className="text-2xl font-bold text-secondary-foreground sm:text-4xl">{s[lang][0]}</h2>
              <p className="mt-2 text-sm text-secondary-foreground/80 sm:text-base">{s[lang][1]}</p>
              <Link to="/category/$slug" params={{ slug: s.to }} className="mt-4 inline-flex rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105">
                {t("shopNow")}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 end-5 flex gap-1.5">
        {slides.map((_, idx) => (
          <button key={idx} aria-label={`slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-2 bg-secondary-foreground/50"}`} />
        ))}
      </div>
    </section>
  );
}
