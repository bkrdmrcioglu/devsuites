import type { Metadata } from "next";
import "./site.css";
import "./portal.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://devsuites.dev"),
  title: {
    default: "DevSuites — Local developer tools for Mac",
    template: "%s — DevSuites",
  },
  description:
    "DevDock, DevMail, DevSQL, and DevCheck — a native macOS suite for local stacks, mail, databases, and ship prep.",
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="atmosphere" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
