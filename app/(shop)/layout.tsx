import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileSearchBar } from "@/components/layout/mobile-search-bar";
import { RouteTransitionProvider } from "@/components/shared/route-transition-provider";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <MobileSearchBar />
      <main className="flex-1">
        <RouteTransitionProvider>
          <WhatsAppButton />
          {children}
        </RouteTransitionProvider>
      </main>
      <SiteFooter />
      {/* <BottomNav /> */}
    </div>
  );
}
