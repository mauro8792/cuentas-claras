import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "SplitApp - Dividí gastos con amigos",
  description: "PWA para dividir gastos entre grupos de amigos de forma simple y transparente",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SplitApp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid rgba(148, 163, 184, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#14b8a6",
                secondary: "#f1f5f9",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f1f5f9",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}

