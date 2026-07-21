import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#continut"
        className="bg-primary text-primary-foreground fixed top-[-100%] left-3 z-[100] px-4 py-3 text-sm font-bold focus-visible:top-3"
      >
        Sari la conținut
      </a>
      <SiteHeader />
      <div id="continut" tabIndex={-1} className="focus:outline-none">
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
