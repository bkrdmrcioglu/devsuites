import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-admin-mono",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-admin-display",
});

export const metadata: Metadata = {
  title: "Admin — DevSuites",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="admin-shell"
      className={`${plexSans.variable} ${plexMono.variable} ${syne.variable} antialiased`}
      style={{
        fontFamily: "var(--font-admin-sans), system-ui, sans-serif",
      }}
    >
      {children}
      <Toaster
        position="top-right"
        theme="light"
        toastOptions={{
          style: {
            fontFamily: "var(--font-admin-sans), system-ui, sans-serif",
          },
        }}
      />
    </div>
  );
}
