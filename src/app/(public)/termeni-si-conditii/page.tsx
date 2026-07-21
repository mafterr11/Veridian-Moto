import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
export const metadata: Metadata = { title: "Termeni și condiții" };
export default function TermsPage() {
  return (
    <LegalPage title="Termeni și condiții" updated="21 iulie 2026">
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Caracter demonstrativ
        </h2>
        <p className="text-steel mt-3">
          Modelele, prețurile, stocurile, adresa și datele comerciale sunt
          fictive și sunt prezentate exclusiv ca parte a unui proiect personal.
        </p>
      </section>
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Configurări și solicitări
        </h2>
        <p className="text-steel mt-3">
          Salvarea unei configurații sau trimiterea formularului de contact nu
          reprezintă o comandă. Referința generată identifică numai selecția
          demonstrativă, iar un eventual răspuns nu creează obligații
          comerciale.
        </p>
      </section>
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Prețuri și disponibilitate
        </h2>
        <p className="text-steel mt-3">
          Valorile afișate includ TVA în scenariul demonstrativ. Ele nu
          reprezintă oferte comerciale și nu pot genera comenzi sau obligații
          contractuale.
        </p>
      </section>
    </LegalPage>
  );
}
