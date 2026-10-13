import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import cheese from "@/assets/cat-cheese.webp";
import sauces from "@/assets/cat-sauces.webp";
import meat from "@/assets/cat-meat.webp";
import pastry from "@/assets/cat-pastry.webp";
import sweets from "@/assets/cat-sweets.webp";
import offers from "@/assets/cat-offers.webp";

export type Product = {
  id: string;
  category: string;
  name: string;
  name_en: string | null;
  weight: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  sales_count: number;
};

export const CATEGORIES = [
  { slug: "offers", ar: "عروووووض", en: "Offers", img: offers },
  { slug: "cheese", ar: "الجبن", en: "Cheese", img: cheese },
  { slug: "sauces", ar: "الصوصات", en: "Sauces", img: sauces },
  { slug: "meat", ar: "اللحوم ومصنعاتها", en: "Meat & Frozen", img: meat },
  { slug: "pastry", ar: "المعجنات", en: "Pastry", img: pastry },
  { slug: "sweets", ar: "حلويات", en: "Sweets", img: sweets },
] as const;

export const categoryOf = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const productImage = (p: Product) => p.image_url || categoryOf(p.category)?.img || offers;

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id,category,name,name_en,weight,price,old_price,image_url,sales_count")
      .eq("active", true)
      .order("id");
    if (error) throw error;
    return (data ?? []).map((p) => ({ ...p, price: Number(p.price), old_price: p.old_price ? Number(p.old_price) : null })) as Product[];
  },
  staleTime: 30_000,
});

export const formatPrice = (n: number, lang: "ar" | "en") =>
  `${n.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 2 })} ${lang === "ar" ? "ج.م" : "EGP"}`;
