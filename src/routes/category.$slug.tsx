import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { categoryOf, productsQuery } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { CategoryBar } from "@/components/store/CategoryBar";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "الأقسام | فريش البرج" },
      { name: "description", content: "تسوق منتجات فريش البرج حسب القسم." },
      { property: "og:title", content: "الأقسام | فريش البرج" },
      { property: "og:description", content: "تسوق منتجات فريش البرج حسب القسم." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { lang } = useI18n();
  const { data } = useSuspenseQuery(productsQuery);
  const items = data.filter((p) => p.category === slug);
  return (
    <div className="space-y-6">
      <CategoryBar active={slug} />
      <h1 className="text-2xl font-bold">{categoryOf(slug)?.[lang] ?? slug}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
