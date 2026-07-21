import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
export const metadata: Metadata = { title: "Politica cookies" };
export default function CookiesPage() {
  return (
    <LegalPage title="Politica cookies" updated="21 iulie 2026">
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Cookie-uri esențiale
        </h2>
        <p className="text-steel mt-3">
          Versiunea curentă nu folosește instrumente de marketing sau urmărire.
          Zona protejată poate utiliza cookie-uri strict necesare autentificării
          administratorului; acestea nu sunt folosite pentru profilare.
        </p>
      </section>
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Analiză opțională
        </h2>
        <p className="text-steel mt-3">
          Orice analiză non-esențială va fi introdusă numai împreună cu un
          mecanism de consimțământ și o descriere actualizată a scopului și
          duratei.
        </p>
      </section>
    </LegalPage>
  );
}
