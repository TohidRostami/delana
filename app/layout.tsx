import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans-arabic/wght.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.site.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: siteConfig.site.keywords,
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: siteConfig.site.name,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: siteConfig.theme.colors.cocoa700,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            classNames: {
              toast: "font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
