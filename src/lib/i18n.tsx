import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  brand: { ar: "فريش البرج", en: "Fresh El Borg" },
  deliverTo: { ar: "التوصيل إلى", en: "Deliver to" },
  location: { ar: "القاهرة، مصر", en: "Cairo, Egypt" },
  search: { ar: "ابحث عن جبن، برجر، صوصات...", en: "Search cheese, burgers, sauces..." },
  noResults: { ar: "لا توجد نتائج", en: "No results" },
  categories: { ar: "الأقسام", en: "Categories" },
  bestSellers: { ar: "الأكثر مبيعاً", en: "Best Sellers" },
  allProducts: { ar: "كل المنتجات", en: "All Products" },
  addToCart: { ar: "أضف للسلة", en: "Add to cart" },
  added: { ar: "تمت الإضافة", en: "Added" },
  cart: { ar: "السلة", en: "Cart" },
  emptyCart: { ar: "سلتك فارغة", en: "Your cart is empty" },
  total: { ar: "الإجمالي", en: "Total" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  home: { ar: "الرئيسية", en: "Home" },
  track: { ar: "تتبع الطلب", en: "Track" },
  account: { ar: "حسابي", en: "Account" },
  egp: { ar: "ج.م", en: "EGP" },
  seeAll: { ar: "عرض الكل", en: "See all" },
  shopNow: { ar: "تسوق الآن", en: "Shop now" },
  name: { ar: "الاسم", en: "Name" },
  phone: { ar: "رقم الهاتف", en: "Phone" },
  address: { ar: "العنوان بالتفصيل", en: "Full address" },
  payment: { ar: "طريقة الدفع", en: "Payment method" },
  cod: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  card: { ar: "بطاقة ائتمان (عند الاستلام عبر ماكينة)", en: "Card (POS on delivery)" },
  placeOrder: { ar: "تأكيد الطلب", en: "Place order" },
  orderPlaced: { ar: "تم استلام طلبك!", en: "Order received!" },
  orderCode: { ar: "رقم الطلب", en: "Order code" },
  enterCode: { ar: "أدخل رقم الطلب", en: "Enter order code" },
  trackBtn: { ar: "تتبع", en: "Track" },
  notFound: { ar: "لم يتم العثور على الطلب", en: "Order not found" },
  st_new: { ar: "تم الاستلام", en: "Received" },
  st_preparing: { ar: "قيد التجهيز", en: "Preparing" },
  st_on_way: { ar: "في الطريق", en: "On the way" },
  st_delivered: { ar: "تم التوصيل", en: "Delivered" },
  st_cancelled: { ar: "ملغي", en: "Cancelled" },
  driver: { ar: "المندوب", en: "Driver" },
  signIn: { ar: "تسجيل الدخول", en: "Sign in" },
  signUp: { ar: "إنشاء حساب", en: "Sign up" },
  signOut: { ar: "تسجيل الخروج", en: "Sign out" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  myOrders: { ar: "طلباتي", en: "My orders" },
  admin: { ar: "لوحة التحكم", en: "Dashboard" },
  checkEmail: { ar: "تحقق من بريدك لتأكيد الحساب", en: "Check your email to confirm" },
  continueGoogle: { ar: "المتابعة عبر Google", en: "Continue with Google" },
  offerBadge: { ar: "عرض", en: "Deal" },
} as const;

export type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "ar",
  setLang: () => {},
  t: (k) => dict[k].ar,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en") setLangState("en");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
