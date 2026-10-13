import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي | فريش البرج" },
      { name: "description", content: "سجّل الدخول لمتابعة طلباتك في فريش البرج." },
      { property: "og:title", content: "حسابي | فريش البرج" },
      { property: "og:description", content: "سجّل الدخول لمتابعة طلباتك في فريش البرج." },
    ],
  }),
  component: Account,
});

function Account() {
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  if (loading) return null;
  if (user)
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-3xl bg-card p-6 shadow-card">
        <p>{user.email}</p>
        {isAdmin && <Link to="/admin" className="block rounded-full bg-gradient-primary py-2.5 text-center font-semibold text-primary-foreground">{t("admin")}</Link>}
        <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-border px-5 py-2">{t("signOut")}</button>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? error.message : t("checkEmail"));
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    }
  };
  const input = "h-11 w-full rounded-xl border border-border bg-card px-3 outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-3 rounded-3xl bg-card p-6 shadow-card">
      <h1 className="text-xl font-bold">{mode === "in" ? t("signIn") : t("signUp")}</h1>
      <input type="email" required placeholder={t("email")} className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required minLength={6} placeholder={t("password")} className={input} value={pw} onChange={(e) => setPw(e.target.value)} />
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <button className="w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground">{mode === "in" ? t("signIn") : t("signUp")}</button>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-primary">{mode === "in" ? t("signUp") : t("signIn")}</button>
    </form>
  );
}
