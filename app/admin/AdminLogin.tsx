"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { adminLogin, type AdminLoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initial: AdminLoginState = { error: null };

type Props = {
  publicPath: string;
};

export function AdminLogin({ publicPath }: Props) {
  const [state, formAction, pending] = useActionState(adminLogin, initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (
      url.searchParams.has("password") ||
      url.searchParams.has("username") ||
      url.hash.includes("password")
    ) {
      window.history.replaceState({}, "", publicPath);
    }
  }, [publicPath]);

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0c1014] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 480px at 10% -10%, rgba(46,214,140,0.22), transparent 55%), radial-gradient(700px 400px at 100% 80%, rgba(230,184,74,0.08), transparent 50%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/mark.png"
            alt=""
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-[15px] font-semibold tracking-tight text-[#eef6f1]">
            DevSuites
          </span>
        </div>

        <div className="relative max-w-md space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2ed68c]">
            Internal console
          </p>
          <h1
            className="text-4xl leading-[1.05] font-extrabold tracking-tight text-[#eef6f1] xl:text-5xl"
            style={{ fontFamily: "var(--font-admin-display), sans-serif" }}
          >
            License management,
            <br />
            device seats,
            <br />
            one screen.
          </h1>
          <p className="text-[15px] leading-relaxed text-[rgba(210,222,216,0.68)]">
            Issue keys, reset hardware seats, and keep activation limits in
            check — same team, quieter room.
          </p>
        </div>

        <p className="relative text-xs text-[rgba(210,222,216,0.4)]">
          Restricted access · session cookies · noindex
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#f7f7f5] px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/mark.png"
              alt=""
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-[#0c1014]">
              DevSuites Ops
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#0c1014]">
              Login
            </h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Use your operations credentials.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-[13px] font-medium text-[#374151]"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                autoComplete="username"
                disabled={pending}
                placeholder="admin"
                spellCheck={false}
                className="h-11 rounded-md border-[#e5e5e0] bg-white text-[#0c1014] shadow-none focus-visible:border-[#2ed68c] focus-visible:ring-[#2ed68c]/25"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[13px] font-medium text-[#374151]"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                disabled={pending}
                placeholder="••••••••"
                className="h-11 rounded-md border-[#e5e5e0] bg-white text-[#0c1014] shadow-none focus-visible:border-[#2ed68c] focus-visible:ring-[#2ed68c]/25"
              />
            </div>

            {state.error ? (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-md bg-[#0c1014] text-[15px] font-semibold text-white hover:bg-[#161b22]"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-[12px] text-[#9ca3af]">
            DevSuites Operations
          </p>
        </div>
      </div>
    </div>
  );
}
