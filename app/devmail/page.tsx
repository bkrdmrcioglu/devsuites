import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CopyableCommand } from "@/components/CopyableCommand";
import { getSessionEmail } from "@/lib/session";

export const metadata: Metadata = {
  title: "DevMail — Catch every local email.",
  description:
    "Native macOS SMTP catcher. Point apps at 127.0.0.1:1025 — HTML preview, magic links, webhooks, Redis. No Docker.",
  openGraph: {
    title: "DevMail",
    description: "Catch every local email.",
    type: "website",
    url: "https://devsuites.dev/devmail/",
    images: ["/assets/devmail-mark.png"],
  },
  twitter: { card: "summary" },
};

export default async function DevMailPage() {
  const email = await getSessionEmail();
  return (
    <>
      <SiteHeader current="devmail" downloadHref="#download" email={email} />

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
            src="/assets/devmail-mark.png"
            width={72}
            height={72}
            alt="DevMail"
          />
          <h1 className="reveal delay-1">DevMail</h1>
          <p className="lede reveal delay-2">Catch every local email.</p>
          <p className="support reveal delay-2">
            Point your app at <code>127.0.0.1:1025</code>. Native inbox with
            HTML, text, headers, attachments, magic links + QR, plus a
            webhook sink and Redis browser — no Mailtrap account, no Docker.
          </p>
          <div className="cta-row reveal delay-3">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devmail-site/releases/download/v0.2.4/DevMail-0.2.4.zip"
            >
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devmail" rel="noopener">
              Buy Pro — $19
            </a>
          </div>
          <div className="reveal delay-3">
            <CopyableCommand
              label="Homebrew"
              command="brew install --cask bkrdmrcioglu/devmail/devmail"
            />
          </div>
          <p className="fine reveal delay-3">
            macOS 14+ · Free keeps last 100 messages · Notarized · Homebrew
          </p>
        </section>

        <section className="shot reveal delay-4" aria-label="Product preview">
          <div className="shot-frame">
            <div className="shot-bar">
              <span />
              <span />
              <span />
              <p>DevMail — local SMTP catcher</p>
            </div>
            <div className="shot-body">
              <aside>
                <p className="aside-label">Inbox</p>
                <div className="row on">
                  <i /> Reset password · noreply@…
                </div>
                <div className="row">
                  <i /> Invite to workspace · team@…
                </div>
                <div className="row">
                  <i /> Magic link · auth@…
                </div>
                <div className="row">
                  <i /> Welcome · hello@…
                </div>
              </aside>
              <div className="detail">
                <p className="status">
                  <i className="dot" /> SMTP :1025
                </p>
                <h2>Reset password</h2>
                <p className="meta">to: you@localhost · HTML + link</p>
                <div className="actions">
                  <span className="chip accent">Open link</span>
                  <span className="chip">QR</span>
                  <span className="chip">Export EML</span>
                </div>
                <pre>smtp://127.0.0.1:1025</pre>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <h2>Inbox that stays local</h2>
          <p className="section-support">
            Built for auth flows, invites, and &ldquo;did the email actually
            send?&rdquo; moments.
          </p>
          <dl className="feature-list">
            <div>
              <dt>Local SMTP</dt>
              <dd>
                Listens on <code>127.0.0.1:1025</code> (configurable). Point
                frameworks with one-line presets for Rails, Laravel,
                Nodemailer, Django, and more.
              </dd>
            </div>
            <div>
              <dt>Rich preview</dt>
              <dd>
                HTML / text / headers / raw / attachments tabs. CID images
                rewritten so HTML looks like production mail.
              </dd>
            </div>
            <div>
              <dt>Magic links</dt>
              <dd>
                Detects reset and sign-in URLs, opens them, or shows a QR for
                phone testing.
              </dd>
            </div>
            <div>
              <dt>Webhook sink</dt>
              <dd>
                POST payloads to a local port and inspect headers + body next
                to your inbox.
              </dd>
            </div>
            <div>
              <dt>Redis peek</dt>
              <dd>
                Connect to local Redis, browse KEYS, peek values — same
                chrome as the mail tool.
              </dd>
            </div>
            <div>
              <dt>Family chrome</dt>
              <dd>
                Settings, license, What&rsquo;s New, GitHub update check, menu
                bar status — same ink/mint as DevDock.
              </dd>
            </div>
          </dl>
        </section>

        <section id="pricing" className="section">
          <h2>Simple pricing</h2>
          <p className="section-support">
            Free to catch mail. Pro when history matters.
          </p>
          <div className="plans">
            <article className="plan">
              <h3>Free</h3>
              <p className="price">$0</p>
              <ul>
                <li>Local SMTP + inbox</li>
                <li>Last 100 messages</li>
                <li>Webhooks + Redis tools</li>
                <li>Presets &amp; What&rsquo;s New</li>
              </ul>
              <a
                className="btn ghost"
                href="https://github.com/bkrdmrcioglu/devmail-site/releases/download/v0.2.4/DevMail-0.2.4.zip"
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
                <li>Unlimited message history</li>
                <li>Pro tools unlocked</li>
                <li>License via Lemon Squeezy</li>
                <li>Move seats between machines</li>
              </ul>
              <a className="btn primary" href="/api/buy/devmail" rel="noopener">
                Buy Pro — $19
              </a>
            </article>
          </div>
        </section>

        <section id="download" className="section">
          <h2>Get DevMail</h2>
          <p className="section-support">
            Notarized Developer ID build. Homebrew cask or zip. Lemon key
            activates Pro in Settings.
          </p>
          <CopyableCommand
            label="Homebrew"
            command="brew install --cask bkrdmrcioglu/devmail/devmail"
          />
          <div className="cta-row">
            <a
              className="btn primary"
              href="https://github.com/bkrdmrcioglu/devmail-site/releases/download/v0.2.4/DevMail-0.2.4.zip"
            >
              Download for Mac
            </a>
            <a className="btn ghost" href="/api/buy/devmail" rel="noopener">
              Buy Pro — $19
            </a>
          </div>
        </section>

        <section id="faq" className="section">
          <h2>FAQ</h2>
          <div className="faq-list">
            <details>
              <summary>Do I need an account?</summary>
              <p>
                No. Mail never leaves your Mac. Only Pro activation and
                update checks talk to the network.
              </p>
            </details>
            <details>
              <summary>Can I change the SMTP port?</summary>
              <p>Yes — Settings → local endpoints. Apply restarts the listener.</p>
            </details>
            <details>
              <summary>Free vs Pro?</summary>
              <p>
                Free keeps the last 100 messages. Pro ($19 one-time) removes
                the cap. License key via Lemon Squeezy — activate in
                Settings.
              </p>
            </details>
            <details>
              <summary>Part of DevSuites?</summary>
              <p>
                Yes — same family as DevDock ($29) and DevSQL ($19) on{" "}
                <a href="/">devsuites.dev</a>.
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
            <a className="sib" href="/devsql">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/devsql-mark.png" alt="" />
              <div>
                <h3>DevSQL</h3>
                <p>Browse SQLite, Postgres, MySQL, Redis</p>
              </div>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter productName="DevMail" />
    </>
  );
}
