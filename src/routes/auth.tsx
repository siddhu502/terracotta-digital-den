import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "लॉगिन — Smart Ness";
const DESCRIPTION = "डिजिटल PDF खरेदी करण्यासाठी आणि तुमची लायब्ररी पाहण्यासाठी Smart Ness मध्ये लॉगिन करा.";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  function destination() {
    return redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";
  }

  async function afterSignIn() {
    // Wait for the session to be readable before navigating away.
    for (let i = 0; i < 20; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) break;
      await new Promise((r) => setTimeout(r, 150));
    }
    navigate({ to: destination() });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("sign-in");
        return;
      }
      await afterSignIn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-wash px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileDown className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl">
            {mode === "sign-in" ? "पुन्हा स्वागत आहे" : "तुमचे खाते तयार करा"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF खरेदी करण्यासाठी आणि तुमची लायब्ररी पाहण्यासाठी लॉगिन करा.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmail}>
          <div className="space-y-2">
            <Label htmlFor="email">ईमेल</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">पासवर्ड</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="किमान 6 अक्षरे"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "sign-in" ? "लॉगिन करा" : "खाते तयार करा"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "sign-in" ? "नवीन आहात?" : "आधीच खाते आहे?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "खाते तयार करा" : "लॉगिन करा"}
          </button>
        </p>
      </div>
    </div>
  );
}
