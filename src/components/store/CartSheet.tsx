import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice, productImage } from "@/lib/products";

export function CartSheet() {
  const { items, open, setOpen, setQty, total } = useCart();
  const { t, lang } = useI18n();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={lang === "ar" ? "left" : "right"} className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("cart")}</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="h-12 w-12" />
            <p>{t("emptyCart")}</p>
          </div>
        ) : (
          <>
            <div className="-mx-2 flex-1 space-y-2 overflow-y-auto px-2">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border p-2">
                  <img src={productImage(i.product)} alt="" width={56} height={56} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(i.product.price, lang)}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-muted p-1">
                    <button aria-label="-" onClick={() => setQty(i.id, i.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full bg-card"><Minus className="h-3 w-3" /></button>
                    <span className="w-5 text-center text-sm font-semibold">{i.qty}</span>
                    <button aria-label="+" onClick={() => setQty(i.id, i.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="mb-3 flex justify-between text-base font-bold">
                <span>{t("total")}</span>
                <span className="text-primary">{formatPrice(total, lang)}</span>
              </div>
              <Link to="/checkout" onClick={() => setOpen(false)} className="block rounded-full bg-gradient-primary py-3 text-center font-semibold text-primary-foreground shadow-glow">
                {t("checkout")}
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
