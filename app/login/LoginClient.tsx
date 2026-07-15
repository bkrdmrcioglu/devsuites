"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

type Props = {
  oauthError?: string | null;
  githubEnabled?: boolean;
};

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

type AuthMode = "password" | "register";

export function LoginClient({
  oauthError = null,
  githubEnabled = false,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("password");

  const [formEmail, setFormEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(oauthError);
  const [busy, setBusy] = useState(false);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: formEmail, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: formEmail, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const githubBlock = githubEnabled ? (
    <div className="portal-oauth">
      <p className="portal-oauth-divider">
        <span>or continue with</span>
      </p>
      <a className="btn github" href="/api/auth/github">
        <GitHubIcon />
        GitHub
      </a>
    </div>
  ) : null;

  return (
    <div className="portal-page">
      <SiteHeader current="login" />

      <main>
        <section className="portal portal-auth">
          <h1>{mode === "register" ? "Create account" : "Login"}</h1>
          <div className="portal-auth-stack">
            <div className="portal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                className={`portal-tab${mode === "password" ? " active" : ""}`}
                aria-selected={mode === "password"}
                onClick={() => switchMode("password")}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                className={`portal-tab${mode === "register" ? " active" : ""}`}
                aria-selected={mode === "register"}
                onClick={() => switchMode("register")}
              >
                Create account
              </button>
            </div>

            {error ? <p className="portal-error">{error}</p> : null}

            {mode === "password" ? (
              <>
                <p className="portal-lede">
                  Sign in with your DevSuites account.
                </p>
                <form className="portal-form" onSubmit={onPasswordLogin}>
                  <label>
                    Email
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={busy}
                  >
                    {busy ? "Signing in…" : "Login"}
                  </button>
                </form>
                {githubBlock}
                <p className="portal-switch">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                  >
                    Create account
                  </button>
                </p>
              </>
            ) : null}

            {mode === "register" ? (
              <>
                <p className="portal-lede">
                  Use the same email as your Lemon purchase so licenses appear
                  automatically.
                </p>
                <form className="portal-form" onSubmit={onRegister}>
                  <label>
                    Email
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                  </label>
                  <label>
                    Password (confirm)
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={busy}
                  >
                    {busy ? "Creating account…" : "Create account"}
                  </button>
                </form>
                {githubBlock}
                <p className="portal-switch">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("password")}>
                    Login
                  </button>
                </p>
              </>
            ) : null}
          </div>
        </section>
      </main>
      <footer className="portal-foot">
        DevSuites account · <a href="/">Back to site</a>
      </footer>
    </div>
  );
}
