import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSessionEmail } from "@/lib/session";

export const metadata: Metadata = {
  title: "DevSuites — Local developer tools for Mac",
  description:
    "DevDock, DevMail, DevSQL, and DevCheck — a native macOS suite for local stacks, mail, databases, and ship prep. Same ink/mint chrome.",
  openGraph: {
    title: "DevSuites",
    description: "Four Mac apps. One local developer suite.",
    type: "website",
    url: "https://devsuites.dev/",
    images: ["/assets/og.png"],
  },
  twitter: { card: "summary" },
};

export default async function HomePage() {
  const email = await getSessionEmail();
  return (
    <>
      <SiteHeader current="home" downloadHref="/#apps" email={email} />

      <main>
        <section className="hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-mark reveal"
            src="/assets/devsuites-mark.png"
            width={72}
            height={72}
            alt=""
          />
          <h1 className="reveal delay-1">DevSuites</h1>
          <p className="lede reveal delay-2">
            Four Mac apps. One local developer suite.
          </p>
          <p className="support reveal delay-2">
            Start stacks, catch mail, browse SQL &amp; Redis, then ship-prep
            with Local Shield + Store Prep — without Docker theater or five
            terminal tabs. Same ink/mint chrome across the family.
          </p>
          <div className="cta-row reveal delay-3">
            <a className="btn primary" href="#apps">
              Meet the apps
            </a>
            <a className="btn ghost" href="#apps">
              Download
            </a>
          </div>
          <p className="fine reveal delay-3">
            macOS 14+ · Free tiers · Pro from $19 one-time · Notarized
          </p>
        </section>

        <section className="suite-visual reveal delay-4" aria-label="Suite preview">
          <div className="suite-bar">
            <span />
            <span />
            <span />
            <p>DevSuites — local morning ritual</p>
          </div>
          <div className="suite-body">
            <a className="suite-pane suite-pane-link" href="/devdock">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pane-mark" src="/assets/devdock-mark.png" alt="" />
              <p className="pane-kicker">Stacks</p>
              <h3>DevDock</h3>
              <p className="pane-line">
                Scan projects. Start API + web + mobile together.
              </p>
              <p className="pane-status">
                <i className="dot" /> Ready · :3000
              </p>
            </a>
            <a className="suite-pane suite-pane-link" href="/devmail">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pane-mark" src="/assets/devmail-mark.png" alt="" />
              <p className="pane-kicker">Mail</p>
              <h3>DevMail</h3>
              <p className="pane-line">
                Catch SMTP on 127.0.0.1:1025 — HTML, links, EML.
              </p>
              <p className="pane-status">
                <i className="dot" /> Listening · :1025
              </p>
            </a>
            <a className="suite-pane suite-pane-link" href="/devsql">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pane-mark" src="/assets/devsql-mark.png" alt="" />
              <p className="pane-kicker">Data</p>
              <h3>DevSQL</h3>
              <p className="pane-line">
                SQLite, Postgres, MySQL, Redis, Supabase — one browser.
              </p>
              <p className="pane-status">
                <i className="dot" /> Connected · local
              </p>
            </a>
            <a className="suite-pane suite-pane-link" href="/devcheck">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pane-mark" src="/assets/devcheck-mark.png" alt="" />
              <p className="pane-kicker">Ship</p>
              <h3>DevCheck</h3>
              <p className="pane-line">
                Localhost headers + App Store prep checklist.
              </p>
              <p className="pane-status">
                <i className="dot" /> Loopback only
              </p>
            </a>
          </div>
        </section>

        <section id="apps" className="section">
          <h2>The apps</h2>
          <p className="section-support">
            Each tool does one job well. Together they cover the morning path
            from boot to first green check.
          </p>

          <div className="app-strip">
            <article id="devdock" className="app">
              <div className="app-side">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/devdock-mark.png" alt="DevDock" />
                <h3>
                  <a href="/devdock">DevDock</a>
                </h3>
                <p className="app-tag">Stacks · ports · workspaces</p>
              </div>
              <div className="app-body">
                <p className="lead">All your local stacks. One workspace.</p>
                <p>
                  Finds Next, Nest, Expo, Flutter, Go, Rails, and 30+ more.
                  Start / stop with real PATH, HTTP Ready pings, logs drawer,
                  simulators, and morning workspaces from the menu bar.
                </p>
                <ul className="app-points">
                  <li>Scan folders · roles · command palette ⌘K</li>
                  <li>Workspaces + morning routine (Pro $29)</li>
                  <li>In-app updates via Homebrew / GitHub</li>
                </ul>
                <div className="app-cta">
                  <a className="btn primary sm" href="/devdock">
                    Explore DevDock
                  </a>
                  <a
                    className="btn ghost sm"
                    href="https://github.com/bkrdmrcioglu/devdock-site/releases/download/v0.2.9/DevDock-0.2.9.zip"
                  >
                    Download
                  </a>
                </div>
              </div>
            </article>

            <article id="devmail" className="app">
              <div className="app-side">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/devmail-mark.png" alt="DevMail" />
                <h3>
                  <a href="/devmail">DevMail</a>
                </h3>
                <p className="app-tag">SMTP · webhooks · Redis peek</p>
              </div>
              <div className="app-body">
                <p className="lead">Catch every local email.</p>
                <p>
                  Point your app at <code>127.0.0.1:1025</code>. Native inbox
                  with HTML preview, magic links + QR, attachments, webhook
                  sink, and a local Redis browser — no Mailtrap account
                  required.
                </p>
                <ul className="app-points">
                  <li>SMTP presets for frameworks</li>
                  <li>Webhook inspect on a local port</li>
                  <li>Free: 100 messages · Pro $19 unlimited</li>
                </ul>
                <div className="app-cta">
                  <a className="btn primary sm" href="/devmail">
                    Explore DevMail
                  </a>
                  <a
                    className="btn ghost sm"
                    href="https://github.com/bkrdmrcioglu/devmail-site/releases/download/v0.2.4/DevMail-0.2.4.zip"
                  >
                    Download
                  </a>
                </div>
              </div>
            </article>

            <article id="devsql" className="app">
              <div className="app-side">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/devsql-mark.png" alt="DevSQL" />
                <h3>
                  <a href="/devsql">DevSQL</a>
                </h3>
                <p className="app-tag">SQLite · Postgres · MySQL · Redis</p>
              </div>
              <div className="app-body">
                <p className="lead">
                  Browse local databases without the heavy GUI.
                </p>
                <p>
                  Open a <code>.sqlite</code> file, connect Homebrew Postgres
                  / MySQL, talk Redis with KEYS / GET, or paste a Supabase
                  host with TLS. Schema sidebar, query editor, result grid —
                  same family chrome.
                </p>
                <ul className="app-points">
                  <li>Install &amp; start engines from the sidebar</li>
                  <li>Passwords in Keychain</li>
                  <li>Free: 3 connections · Pro $19 unlimited</li>
                </ul>
                <div className="app-cta">
                  <a className="btn primary sm" href="/devsql">
                    Explore DevSQL
                  </a>
                  <a
                    className="btn ghost sm"
                    href="https://github.com/bkrdmrcioglu/devsql-site/releases/download/v0.2.4/DevSQL-0.2.4.zip"
                  >
                    Download
                  </a>
                </div>
              </div>
            </article>

            <article id="devcheck" className="app">
              <div className="app-side">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/devcheck-mark.png" alt="DevCheck" />
                <h3>
                  <a href="/devcheck">DevCheck</a>
                </h3>
                <p className="app-tag">Local Shield · Store Prep</p>
              </div>
              <div className="app-body">
                <p className="lead">Localhost shield + store prep.</p>
                <p>
                  Grade local HTTP security headers (remote hosts blocked),
                  then run App Store readiness checklist + static scan for
                  secrets, ATS, and high-risk rejection patterns.
                </p>
                <ul className="app-points">
                  <li>securityheaders-style grades · loopback only</li>
                  <li>Store Prep + Code Guard with guided fixes</li>
                  <li>Free: 1 project · Pro $19 unlimited</li>
                </ul>
                <div className="app-cta">
                  <a className="btn primary sm" href="/devcheck">
                    Explore DevCheck
                  </a>
                  <a
                    className="btn ghost sm"
                    href="https://github.com/bkrdmrcioglu/devcheck-site/releases/download/v0.2.8/DevCheck-0.2.8.zip"
                  >
                    Download
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="ritual" className="section">
          <h2>One morning ritual</h2>
          <p className="section-support">
            How the three apps sit together on a real workday.
          </p>
          <dl className="ritual-list">
            <div>
              <dt>Boot stacks</dt>
              <dd>
                DevDock morning routine brings up API + web + mobile. HTTP
                Ready tells you when localhost answers.
              </dd>
            </div>
            <div>
              <dt>Watch mail</dt>
              <dd>
                DevMail sits on :1025 while you trigger password resets,
                invites, and magic links from the app under test.
              </dd>
            </div>
            <div>
              <dt>Peek data</dt>
              <dd>
                DevSQL opens the SQLite file or local Postgres / Redis so you
                confirm the row without a browser tab maze.
              </dd>
            </div>
            <div>
              <dt>Same chrome</dt>
              <dd>
                Ink panels, mint accents, Settings, What&rsquo;s New, license,
                and update checks — learn one, know them all.
              </dd>
            </div>
          </dl>
        </section>

        <section id="faq" className="section">
          <h2>FAQ</h2>
          <p className="section-support">
            Short answers for the suite, not a support novel.
          </p>
          <div className="faq-list">
            <details>
              <summary>What is DevSuites?</summary>
              <p>
                The family name and site for four native macOS developer
                tools: DevDock (stacks), DevMail (SMTP/webhooks), DevSQL
                (databases &amp; Redis), and DevCheck (shield + store prep).
                Each app is sold and versioned on its own.
              </p>
            </details>
            <details>
              <summary>Do I need all three?</summary>
              <p>
                No. Install only what you use. They share design language and
                license patterns, not a bundle installer (yet).
              </p>
            </details>
            <details>
              <summary>macOS versions?</summary>
              <p>
                macOS 14 Sonoma or later. Apple Silicon first; Intel where a
                universal/arm64 build is published.
              </p>
            </details>
            <details>
              <summary>Free vs Pro?</summary>
              <p>
                Each app has its own Free cap and a one-time Pro unlock via
                Lemon Squeezy: DevDock $29 · DevMail $19 · DevSQL $19 ·
                DevCheck $19. Licenses are per product — not one key for the
                whole suite.
              </p>
            </details>
            <details>
              <summary>Where do I download?</summary>
              <p>
                All four apps ship Mac builds. Prefer Homebrew, or grab the
                zip from each app page — Download buttons above pull the
                latest release.
              </p>
            </details>
            <details>
              <summary>Privacy?</summary>
              <p>
                Work stays on your Mac. Update checks hit GitHub Releases;
                Pro activation talks to Lemon Squeezy. No project source or
                mailbox content is uploaded for browsing.
              </p>
            </details>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
