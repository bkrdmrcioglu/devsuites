import type { Metadata } from "next";
import "./portal.css";

export const metadata: Metadata = {
  title: "DevSuites",
  description: "Local developer tools for Mac",
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
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css?v=4" />
        <link rel="icon" type="image/png" href="/assets/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
