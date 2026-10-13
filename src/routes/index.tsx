import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { HeroSlider } from "@/components/store/HeroSlider";
import { CategoryBar } from "@/components/store/CategoryBar";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "فريش البرج | مجمدات ومنتجات غذائية" },
      { name: "description", content: "تسوق الجبن واللحوم والصوصات والمعجنات والحلويات من فريش البرج مع توصيل سريع." },
      { property: "og:title", content: "فريش البرج | مجمدات ومنتجات غذائية" },
      { property: "og:description", content: "تسوق الجبن واللحوم والصوصات والمعجنات والحلويات من فريش البرج مع توصيل سريع." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const { data } = useSuspenseQuery(productsQuery);
  const best = [...data].sort((a, b) => b.sales_count - a.sales_count).slice(0, 5);
  return (
    <div className="space-y-8">
      <HeroSlider />
      <section className="space-y-3"><h2 className="text-xl font-bold">{t("categories")}</h2><CategoryBar /></section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("bestSellers")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {best.map((p, i) => <ProductCard key={p.id} p={p} rank={i + 1} />)}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("allProducts")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
