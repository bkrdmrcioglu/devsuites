import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CopyableCommand } from "@/components/CopyableCommand";
import { getSessionEmail } from "@/lib/session";

export const metadata: Metadata = {
  title: "DevSQL — Local SQL & Redis browser for Mac",
  description:
    "Native macOS browser for SQLite, PostgreSQL, MySQL/MariaDB, Redis, and Supabase. Schema, query, Homebrew engine controls.",
  openGraph: {
    title: "DevSQL",
    description: "Browse local databases without the heavy GUI.",
    type: "website",
    url: "https://devsuites.dev/devsql/",
    images: ["/assets/devsql-mark.png"],
  },
  twitter: { card: "summary" },
};

export default async function DevSqlPage() {
  const email = await getSessionEmail();
  return (
    <>
      <SiteHeader current="devsql" downloadHref="#download" email={email} />

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
            src="/assets/devsql-mark.png"
            width={72}
            height={72}
            alt="DevSQL"
          />
          <h1 className="reveal delay-1">DevSQL</h1>
          <p className="lede reveal delay-2">
            Browse local databases without the heavy GUI.
          </p>
          <p className="support reveal delay-2">
            Open a <code>.sqlite</code> file, talk to Homebrew Postgres /
            MySQL, run Redis KEYS / GET, or paste a Supabase host with TLS.
            Schema sidebar, query editor, result grid — ink/mint chrome.
          </p>
          <div className="cta-row reveal delay-3">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devsql-site/releases/download/v0.2.4/DevSQL-0.2.4.zip"
            >
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devsql" rel="noopener">
              Buy Pro — $19
            </a>
          </div>
          <div className="reveal delay-3">
            <CopyableCommand
              label="Homebrew"
              command="brew install --cask bkrdmrcioglu/devsql/devsql"
            />
          </div>
          <p className="fine reveal delay-3">
            macOS 14+ · Free: 3 connections · Notarized · Homebrew
          </p>
        </section>

        <section className="shot reveal delay-4" aria-label="Product preview">
          <div className="shot-frame">
            <div className="shot-bar">
              <span />
              <span />
              <span />
              <p>DevSQL — local SQL · Redis browser</p>
            </div>
            <div className="shot-body">
              <aside>
                <p className="aside-label">Connections</p>
                <div className="row on">
                  <i /> Local Postgres · :5432
                </div>
                <div className="row">
                  <i /> app.sqlite
                </div>
                <div className="row">
                  <i /> Redis · :6379
                </div>
                <div className="row">
                  <i /> Supabase · TLS
                </div>
              </aside>
              <div className="detail">
                <p className="status">
                  <i className="dot" /> Connected
                </p>
                <h2>public.users</h2>
                <p className="meta">SELECT * · 24 rows · 12.4 ms</p>
                <div className="actions">
                  <span className="chip accent">Run</span>
                  <span className="chip">Refresh</span>
                  <span className="chip">Close</span>
                </div>
                <pre>SELECT id, email FROM users LIMIT 50;</pre>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <h2>Engines that matter locally</h2>
          <p className="section-support">
            One browser for the databases you actually run while shipping.
          </p>
          <dl className="feature-list">
            <div>
              <dt>SQLite</dt>
              <dd>
                Open <code>.sqlite</code> / <code>.db</code> files. Schema
                list + ad-hoc SQL without leaving the desk.
              </dd>
            </div>
            <div>
              <dt>PostgreSQL</dt>
              <dd>
                Host, port, user, database. Passwords stored in Keychain.
                Works with local Homebrew / Docker.
              </dd>
            </div>
            <div>
              <dt>MySQL / MariaDB</dt>
              <dd>Same remote form on port 3306 — LAN or localhost.</dd>
            </div>
            <div>
              <dt>Redis</dt>
              <dd>
                RESP client for KEYS, GET, PING, HGETALL. Keys show in the
                schema pane.
              </dd>
            </div>
            <div>
              <dt>Supabase</dt>
              <dd>
                Postgres over TLS preset — paste{" "}
                <code>db.*.supabase.co</code> and the database password.
              </dd>
            </div>
            <div>
              <dt>Engine controls</dt>
              <dd>
                Install, start, stop, restart local Postgres / MySQL / Redis
                from the sidebar when Homebrew is available.
              </dd>
            </div>
            <div>
              <dt>Family chrome</dt>
              <dd>
                About, Settings, license, What&rsquo;s New, update check,
                menu bar — same suite language as DevDock.
              </dd>
            </div>
          </dl>
        </section>

        <section id="pricing" className="section">
          <h2>Simple pricing</h2>
          <p className="section-support">
            Free to peek. Pro when you keep many connections.
          </p>
          <div className="plans">
            <article className="plan">
              <h3>Free</h3>
              <p className="price">$0</p>
              <ul>
                <li>Up to 3 saved connections</li>
                <li>All engines</li>
                <li>Schema + query + results</li>
                <li>Homebrew install &amp; start</li>
              </ul>
              <a
                className="btn ghost"
                href="https://github.com/bkrdmrcioglu/devsql-site/releases/download/v0.2.4/DevSQL-0.2.4.zip"
              >
                Download .zip
              </a>
            </article>
            <article className="plan featured">
              <h3>Pro</h3>
              <p className="price">
                $19 <span>one-time</span>
              </p>
              <ul>
                <li>Unlimited connections</li>
                <li>Lemon Squeezy license</li>
                <li>Move seats between machines</li>
                <li>Same suite Settings UX</li>
              </ul>
              <a className="btn primary" href="/api/buy/devsql" rel="noopener">
                Buy Pro — $19
              </a>
            </article>
          </div>
        </section>

        <section id="download" className="section">
          <h2>Get DevSQL</h2>
          <p className="section-support">
            Notarized Developer ID build. Homebrew cask or zip. Activate Pro
            in Settings with your Lemon key.
          </p>
          <CopyableCommand
            label="Homebrew"
            command="brew install --cask bkrdmrcioglu/devsql/devsql"
          />
          <div className="cta-row">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devsql-site/releases/download/v0.2.4/DevSQL-0.2.4.zip"
            >
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devsql" rel="noopener">
              Buy Pro — $19
            </a>
          </div>
        </section>

        <section id="faq" className="section">
          <h2>FAQ</h2>
          <div className="faq-list">
            <details>
              <summary>Does it replace TablePlus?</summary>
              <p>
                No — DevSQL is for fast local peeks while coding, not full DB
                admin / modeling.
              </p>
            </details>
            <details>
              <summary>Are passwords safe?</summary>
              <p>
                Stored in macOS Keychain per connection. Nothing is uploaded
                for browsing.
              </p>
            </details>
            <details>
              <summary>Free vs Pro?</summary>
              <p>
                Free keeps 3 saved connections. Pro ($19 one-time) removes
                the cap. License key via Lemon Squeezy — activate in
                Settings.
              </p>
            </details>
            <details>
              <summary>Supabase?</summary>
              <p>
                Yes — it is Postgres over TLS, not a separate protocol. Use
                the Supabase preset in Add.
              </p>
            </details>
          </div>
        </section>

        <section className="section">
          <h2>More in the suite</h2>
          <div className="sibs">
            <a className="sib" href="/devdock">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devdock-mark.png" alt="" />
              <div>
                <h3>DevDock</h3>
                <p>Start API + web + mobile together</p>
              </div>
            </a>
            <a className="sib" href="/devmail">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devmail-mark.png" alt="" />
              <div>
                <h3>DevMail</h3>
                <p>Catch local SMTP · webhooks</p>
              </div>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter productName="DevSQL" />
    </>
  );
}
