import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CopyableCommand } from "@/components/CopyableCommand";
import { getSessionEmail } from "@/lib/session";

export const metadata: Metadata = {
  title: "DevCheck — Localhost shield + store prep + code guard.",
  description:
    "Native macOS app: localhost HTTP header grades, App Store / Play prep with educational findings, and static Code Guard — never remote host scans.",
  openGraph: {
    title: "DevCheck",
    description: "Localhost shield + store prep + code guard.",
    type: "website",
    url: "https://devsuites.dev/devcheck/",
    images: ["/assets/devcheck-mark.png"],
  },
  twitter: { card: "summary" },
};

export default async function DevCheckPage() {
  const email = await getSessionEmail();
  return (
    <>
      <SiteHeader current="devcheck" downloadHref="#download" email={email} />

      <main>
        <section className="hero product">
          <a className="suite-chip reveal" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/mark.png" alt="" /> Part of{" "}
            <strong>DevSuites</strong>
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-mark reveal"
            src="/assets/devcheck-mark.png"
            width={72}
            height={72}
            alt="DevCheck"
          />
          <h1 className="reveal delay-1">DevCheck</h1>
          <p className="lede reveal delay-2">
            Localhost shield + store prep + code guard.
          </p>
          <p className="support reveal delay-2">
            Grade your local app&rsquo;s HTTP security headers (never remote
            hosts), prep App Store / Play with guided checklists, and scan
            mobile + web code for XSS/SQLi/secrets patterns — each finding
            explains what, why, and how to fix.
          </p>
          <div className="cta-row reveal delay-3">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devcheck-site/releases/download/v0.2.8/DevCheck-0.2.8.zip"
            >
              <svg
                className="btn-ico"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3v12m0 0l4-4m-4 4l-4-4M5 19h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devcheck" rel="noopener">
              <svg
                className="btn-ico"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16l-1.2 11.2a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 7zm4-3h8l1 3H7l1-3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Buy Pro — $19
            </a>
          </div>
          <div className="reveal delay-3">
            <CopyableCommand
              label="Homebrew"
              command="brew install --cask bkrdmrcioglu/devcheck/devcheck"
            />
          </div>
          <p className="fine reveal delay-3">
            macOS 14+ · Free: Local Shield + 1 Store Prep project · Pro $19
            one-time · Notarized
          </p>
        </section>

        <section className="shot reveal delay-4" aria-label="Product preview">
          <div className="shot-frame">
            <div className="shot-bar">
              <span />
              <span />
              <span />
              <p>DevCheck — Local Shield · Store Prep · Code Guard</p>
            </div>
            <div className="shot-body shot-body-rich">
              <aside>
                <p className="aside-label">Tools</p>
                <div className="row on">
                  <svg
                    className="row-ico"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  Local Shield
                </div>
                <div className="row">
                  <svg
                    className="row-ico"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 7h16v12H4V7zm2-3h12l1 3H5l1-3zm3 8h8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Store Prep
                </div>
                <div className="row">
                  <svg
                    className="row-ico"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 11-10 0v-1H6a3 3 0 010-6h1V9a5 5 0 015-5z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  Code Guard
                </div>
                <div className="row muted">
                  <svg
                    className="row-ico"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M12 8v4l2.5 1.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  http://127.0.0.1:3000
                </div>
              </aside>
              <div className="detail">
                <div className="detail-top">
                  <p className="status">
                    <i className="dot" /> Loopback only
                  </p>
                  <div className="grade-badge" aria-label="Grade A minus">
                    A−
                  </div>
                </div>
                <h2>Header grade</h2>
                <p className="meta">CSP · cookies · CORS · expand for why + fix</p>
                <ul className="check-mini" aria-label="Sample checks">
                  <li className="ok">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                      <path
                        d="M8 12.5l2.5 2.5L16 9.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    X-Content-Type-Options
                  </li>
                  <li className="warn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 4l9 16H3L12 4z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 10v4m0 3h.01"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    Content-Security-Policy weak
                  </li>
                  <li className="miss">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Permissions-Policy missing
                  </li>
                </ul>
                <div className="actions">
                  <span className="chip accent">Scan</span>
                  <span className="chip">Copy fix</span>
                  <span className="chip">Baseline</span>
                </div>
                <pre>Blocked: remote hosts rejected</pre>
              </div>
            </div>
          </div>
        </section>

        <section id="pillars" className="section">
          <h2>Three jobs. One Mac app.</h2>
          <p className="section-support">
            Ship-ready hygiene without turning into a pentest weapon.
          </p>
          <div className="tool-grid">
            <article className="tool-tile">
              <div className="tool-ico" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Local Shield</h3>
              <p>
                securityheaders-style A+→F on <code>localhost</code> only.
                Weak checks expand into why it matters and copyable Next /
                Express / nginx fixes.
              </p>
            </article>
            <article className="tool-tile">
              <div className="tool-ico" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16v12H4V7zm2-3h12l1 3H5l1-3z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 12h8M8 16h5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Store Prep</h3>
              <p>
                App Store + Play checklists with how-to-pass notes, privacy
                manifest audit, diff vs last scan, Markdown / PDF export
                (Pro).
              </p>
            </article>
            <article className="tool-tile">
              <div className="tool-ico" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 11-10 0v-1H6a3 3 0 010-6h1V9a5 5 0 015-5z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path d="M10 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Code Guard</h3>
              <p>
                Static XSS / SQL / command / secrets patterns for mobile +
                web + API. Educational findings — never live exploit probes.
              </p>
            </article>
          </div>
        </section>

        <section id="features" className="section">
          <h2>Built for the submit week</h2>
          <p className="section-support">
            Every finding teaches — not just a red flag.
          </p>
          <dl className="feature-list feature-list-icons">
            <div>
              <dt>
                <span className="feat-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16M4 12h10M4 18h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Guided findings
              </dt>
              <dd>
                Expand any Shield, Store, or Guard hit for{" "}
                <strong>what we found</strong>, <strong>why it matters</strong>,
                and <strong>how to fix</strong> — plus safer code when it
                helps.
              </dd>
            </div>
            <div>
              <dt>
                <span className="feat-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                Loopback gate
              </dt>
              <dd>
                Remote hosts are rejected before any request. Only{" "}
                <code>localhost</code> / <code>127.0.0.1</code> /{" "}
                <code>*.localhost</code>.
              </dd>
            </div>
            <div>
              <dt>
                <span className="feat-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 7h8M7 11h10M9 15h6M6 4h12v16H6V4z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                App Store + Play
              </dt>
              <dd>
                Toggle store target. Checklist items explain how to pass.
                Diff shows fixed vs new since last check.
              </dd>
            </div>
            <div>
              <dt>
                <span className="feat-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 7h10v10H7V7zm-3 3H2v8a2 2 0 002 2h8v-2M15 2h2a2 2 0 012 2v8h-2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Free + Pro
              </dt>
              <dd>
                Free keeps Local Shield + one Store Prep project + Code Guard
                criticals. Pro ($19 one-time) unlocks the rest.
              </dd>
            </div>
            <div>
              <dt>
                <span className="feat-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 12a8 8 0 018-8h1v3l4-4-4-4v3h-1a11 11 0 100 22 11 11 0 0010.4-7h-3.1A8 8 0 014 12z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Family chrome
              </dt>
              <dd>
                Same ink/mint Settings, license, and What&rsquo;s New as
                DevDock, DevMail, and DevSQL.
              </dd>
            </div>
          </dl>
        </section>

        <section id="pricing" className="section">
          <h2>Simple pricing</h2>
          <p className="section-support">
            Free for local headers. Pro when you prep many apps.
          </p>
          <div className="plans">
            <article className="plan">
              <div className="plan-head">
                <span className="plan-ico" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </span>
                <h3>Free</h3>
              </div>
              <p className="price">$0</p>
              <ul>
                <li>Local Shield (localhost only)</li>
                <li>1 Store Prep project</li>
                <li>Critical checklist items</li>
                <li>Code Guard · critical findings</li>
              </ul>
              <a
                className="btn ghost"
                href="https://github.com/bkrdmrcioglu/devcheck-site/releases/download/v0.2.8/DevCheck-0.2.8.zip"
              >
                Download
              </a>
            </article>
            <article className="plan featured">
              <div className="plan-head">
                <span className="plan-ico accent" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l2.2 6.6H21l-5.4 4 2.1 6.5L12 16.7 6.3 20l2.1-6.5L3 9.6h6.8L12 3z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3>Pro</h3>
              </div>
              <p className="price">
                $19 <span>one-time</span>
              </p>
              <ul>
                <li>Unlimited Store Prep projects</li>
                <li>Full guideline checklist + export</li>
                <li>Code Guard · all severities</li>
                <li>Lemon Squeezy license</li>
              </ul>
              <a className="btn primary" href="/api/buy/devcheck" rel="noopener">
                Buy Pro — $19
              </a>
            </article>
          </div>
        </section>

        <section id="download" className="section">
          <h2>Get DevCheck</h2>
          <p className="section-support">
            Notarized Developer ID build. Homebrew cask or zip. Lemon key
            activates Pro in Settings.
          </p>
          <CopyableCommand
            label="Homebrew"
            command="brew install --cask bkrdmrcioglu/devcheck/devcheck"
          />
          <div className="cta-row">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devcheck-site/releases/download/v0.2.8/DevCheck-0.2.8.zip"
            >
              <svg
                className="btn-ico"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3v12m0 0l4-4m-4 4l-4-4M5 19h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devcheck" rel="noopener">
              Buy Pro — $19
            </a>
          </div>
        </section>

        <section id="faq" className="section">
          <h2>FAQ</h2>
          <div className="faq-list">
            <details>
              <summary>
                <span className="faq-ico" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                Can it scan production URLs?
              </summary>
              <p>
                No. Remote hosts are rejected before any request. Only
                loopback / *.localhost.
              </p>
            </details>
            <details>
              <summary>
                <span className="faq-ico" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M12 8v5m0 3h.01"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Is this a guarantee of App Store approval?
              </summary>
              <p>
                No — it&rsquo;s a prep aid: checklist + static heuristics
                inspired by common rejection patterns, not a substitute for
                Apple&rsquo;s guidelines.
              </p>
            </details>
            <details>
              <summary>
                <span className="faq-ico" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 4a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 11-10 0v-1H6a3 3 0 010-6h1V9a5 5 0 015-5z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                Does Code Guard exploit apps?
              </summary>
              <p>
                No. It only matches insecure patterns in your local source
                (sinks, secrets). It never sends attack payloads.
              </p>
            </details>
            <details>
              <summary>
                <span className="faq-ico" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7h16l-1.2 11.2a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 7z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                Free vs Pro?
              </summary>
              <p>
                Free: Local Shield + 1 Store Prep project (partial checklist)
                + Code Guard criticals. Pro ($19 one-time): unlimited
                projects + full checklist + export + all severities.
              </p>
            </details>
            <details>
              <summary>
                <span className="faq-ico" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M11 12h2" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                Part of DevSuites?
              </summary>
              <p>
                Yes — same family as DevDock ($29), DevMail ($19), and DevSQL
                ($19) on <a href="/">devsuites.dev</a>.
              </p>
            </details>
          </div>
        </section>

        <section className="section">
          <h2>More in the suite</h2>
          <p className="section-support">Same ink/mint chrome. Different jobs.</p>
          <div className="sibs sibs-3">
            <a className="sib" href="/devdock">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devdock-mark.png" alt="" />
              <div>
                <h3>DevDock</h3>
                <p>Stacks · ports · workspaces</p>
              </div>
            </a>
            <a className="sib" href="/devmail">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devmail-mark.png" alt="" />
              <div>
                <h3>DevMail</h3>
                <p>Local SMTP · webhooks · Redis</p>
              </div>
            </a>
            <a className="sib" href="/devsql">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devsql-mark.png" alt="" />
              <div>
                <h3>DevSQL</h3>
                <p>SQLite · Postgres · MySQL · Redis</p>
              </div>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <p>
          DevCheck · part of <a href="/">DevSuites</a>
        </p>
      </footer>
    </>
  );
}
