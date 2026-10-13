import { Link } from "@tanstack/react-router";
import { Home, MapPinned, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export function BottomNav() {
  const { t } = useI18n();
  const { setOpen, count } = useCart();
  const cls = "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground";
  const active = { className: `${cls} !text-primary font-semibold` };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="flex">
        <Link to="/" className={cls} activeProps={active} activeOptions={{ exact: true }}><Home className="h-5 w-5" />{t("home")}</Link>
        <Link to="/track" search={{}} className={cls} activeProps={active}><MapPinned className="h-5 w-5" />{t("track")}</Link>
        <button onClick={() => setOpen(true)} className={`${cls} relative`}>
          <ShoppingBag className="h-5 w-5" />{t("cart")}
          {count > 0 && <span className="absolute top-1 start-1/2 ms-2 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{count}</span>}
        </button>
        <Link to="/account" className={cls} activeProps={active}><User className="h-5 w-5" />{t("account")}</Link>
      </div>
    </nav>
  );
}
