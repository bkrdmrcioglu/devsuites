import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CopyableCommand } from "@/components/CopyableCommand";
import { getSessionEmail } from "@/lib/session";

export const metadata: Metadata = {
  title: "DevDock — All your local stacks. One workspace.",
  description:
    "macOS app that finds your local projects and starts API, web, and mobile stacks in one click. Workspaces, simulators, ports, updates.",
  openGraph: {
    title: "DevDock",
    description: "All your local stacks. One workspace.",
    type: "website",
    url: "https://devsuites.dev/devdock/",
    images: ["/assets/devdock-mark.png"],
  },
  twitter: { card: "summary" },
};

export default async function DevDockPage() {
  const email = await getSessionEmail();
  return (
    <>
      <SiteHeader current="devdock" downloadHref="#download" email={email} />

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
            src="/assets/devdock-mark.png"
            width={72}
            height={72}
            alt="DevDock"
          />
          <h1 className="reveal delay-1">DevDock</h1>
          <p className="lede reveal delay-2">
            All your local stacks. One workspace.
          </p>
          <p className="support reveal delay-2">
            Scan projects. Start API + web + mobile together. Simulators,
            ports, logs, and one-tap updates — from the app or the menu bar.
            No Docker circus.
          </p>
          <div className="cta-row reveal delay-3">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devdock-site/releases/download/v0.2.9/DevDock-0.2.9.zip"
            >
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devdock" rel="noopener">
              Buy Pro — $29
            </a>
          </div>
          <div className="reveal delay-3">
            <CopyableCommand
              label="Homebrew"
              command="brew install --cask bkrdmrcioglu/devdock/devdock"
            />
          </div>
          <p className="fine reveal delay-3">
            macOS 14+ · Free for 3 projects · Notarized Developer ID
          </p>
        </section>

        <section className="shot reveal delay-4" aria-label="Product preview">
          <div className="shot-frame">
            <div className="shot-bar">
              <span />
              <span />
              <span />
              <p>DevDock — local workspace manager</p>
            </div>
            <div className="shot-body">
              <aside>
                <p className="aside-label">Projects</p>
                <div className="row on">
                  <i /> harbor/api · Nest · :3000
                </div>
                <div className="row">
                  <i /> harbor/mobile · Expo · :8081
                </div>
                <div className="row on ext">
                  <i /> pulse-store · Next · :3001
                </div>
                <div className="row">
                  <i /> ledger · Go · :8080
                </div>
              </aside>
              <div className="detail">
                <p className="status">
                  <i className="dot" /> Ready
                </p>
                <h2>harbor/api</h2>
                <p className="meta">NestJS · localhost:3000</p>
                <div className="actions">
                  <span className="chip accent">Stop</span>
                  <span className="chip">Open</span>
                  <span className="chip">Logs</span>
                </div>
                <pre>npm run start:dev</pre>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <h2>Everything in the dock</h2>
          <p className="section-support">
            Built for the morning ritual — replace five terminals and a
            sticky note of ports.
          </p>
          <dl className="feature-list">
            <div>
              <dt>Scan &amp; detect</dt>
              <dd>
                Watches folders for Next.js, Nest, Laravel, Flutter, Expo,
                React Native, Swift, Kotlin, Go, Rust, Django, Rails, Spring,
                and 30+ more — including monorepo paths.
              </dd>
            </div>
            <div>
              <dt>Start / Stop / Restart</dt>
              <dd>
                Runs real scripts with a proper GUI PATH (nvm, FVM, Homebrew).
                Stops process trees cleanly. Busy ports remap or warn.
              </dd>
            </div>
            <div>
              <dt>HTTP Ready</dt>
              <dd>
                Pings localhost until the stack answers. Ready / Waiting in
                the UI and menu bar. Optional macOS notification.
              </dd>
            </div>
            <div>
              <dt>Logs drawer</dt>
              <dd>
                Live logs from the right edge. Errors / Warnings tabs, copy,
                auto-open when Start fails.
              </dd>
            </div>
            <div>
              <dt>Mobile targets</dt>
              <dd>
                Quick targets for iOS Simulator / Android Emulator — never a
                physical phone by mistake. Device list for Expo, RN, Ionic,
                Flutter.
              </dd>
            </div>
            <div>
              <dt>Workspaces</dt>
              <dd>
                Group API + web + mobile. Staggered starts, morning routine
                ⌘⇧M, menu bar controls (Pro).
              </dd>
            </div>
            <div>
              <dt>Command palette</dt>
              <dd>
                ⌘K for Rescan, Morning, Stop all, jump to projects,
                What&rsquo;s new, Check for updates.
              </dd>
            </div>
            <div>
              <dt>In-app updates</dt>
              <dd>
                Checks GitHub Releases. Tap Update — Homebrew upgrades and
                relaunches the notarized app.
              </dd>
            </div>
          </dl>
        </section>

        <section id="pricing" className="section">
          <h2>Simple pricing</h2>
          <p className="section-support">Pay once. Own the workflow.</p>
          <div className="plans">
            <article className="plan">
              <h3>Free</h3>
              <p className="price">$0</p>
              <ul>
                <li>Up to 3 projects</li>
                <li>Start / Stop / Open / Logs</li>
                <li>Scan, ports, mobile targets</li>
                <li>In-app updates</li>
              </ul>
              <a
                className="btn ghost"
                href="https://github.com/bkrdmrcioglu/devdock-site/releases/download/v0.2.9/DevDock-0.2.9.zip"
              >
                Download
              </a>
            </article>
            <article className="plan featured">
              <h3>Pro</h3>
              <p className="price">
                $29 <span>one-time</span>
              </p>
              <ul>
                <li>Unlimited projects</li>
                <li>Workspaces &amp; morning routine</li>
                <li>Menu bar controls</li>
                <li>External port awareness</li>
              </ul>
              <a className="btn primary" href="/api/buy/devdock" rel="noopener">
                Buy Pro — $29
              </a>
            </article>
          </div>
        </section>

        <section id="download" className="section">
          <h2>Download</h2>
          <p className="section-support">
            Free for everyone — up to 3 projects. Notarized Developer ID
            build.
          </p>
          <CopyableCommand
            label="Homebrew"
            command="brew install --cask bkrdmrcioglu/devdock/devdock"
          />
          <div className="cta-row">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devdock-site/releases/download/v0.2.9/DevDock-0.2.9.zip"
            >
              Download .zip
            </a>
            <a className="btn ghost" href="/api/buy/devdock" rel="noopener">
              Buy Pro — $29
            </a>
          </div>
        </section>

        <section id="faq" className="section">
          <h2>FAQ</h2>
          <div className="faq-list">
            <details>
              <summary>What is DevDock?</summary>
              <p>
                A native macOS app that scans project folders, detects
                frameworks, and starts / stops local stacks with logs, ports,
                and workspaces.
              </p>
            </details>
            <details>
              <summary>Free vs Pro?</summary>
              <p>
                Free: up to 3 projects. Pro ($29 one-time): unlimited
                projects, workspaces, menu bar, external port awareness.
              </p>
            </details>
            <details>
              <summary>Where is source?</summary>
              <p>
                Swift source stays private. Only the notarized Mac binary
                (and this site) are public.
              </p>
            </details>
            <details>
              <summary>Privacy?</summary>
              <p>
                Projects run on your machine. Update checks hit GitHub; Pro
                talks to Lemon Squeezy. No source is uploaded.
              </p>
            </details>
          </div>
        </section>

        <section className="section">
          <h2>More in the suite</h2>
          <p className="section-support">Same ink/mint chrome. Different jobs.</p>
          <div className="sibs">
            <a className="sib" href="/devmail">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devmail-mark.png" alt="" />
              <div>
                <h3>DevMail</h3>
                <p>Catch local SMTP · webhooks · Redis peek</p>
              </div>
            </a>
            <a className="sib" href="/devsql">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devsql-mark.png" alt="" />
              <div>
                <h3>DevSQL</h3>
                <p>SQLite · Postgres · MySQL · Redis · Supabase</p>
              </div>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter productName="DevDock" />
    </>
  );
}
