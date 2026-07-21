import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
export const metadata: Metadata = { title: "Politica de confidențialitate" };
export default function PrivacyPage() {
  return (
    <LegalPage title="Politica de confidențialitate" updated="21 iulie 2026">
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Proiect demonstrativ
        </h2>
        <p className="text-steel mt-3">
          VERIDIAN Moto este un brand fictiv și nu oferă conturi de client.
          Configurațiile publice salvează doar modelul, opțiunile și prețurile;
          nu conțin nume, email sau telefon. Nu introduce date reale într-o
          instalare publică demonstrativă dacă proprietarul proiectului nu a
          configurat un proces de confidențialitate.
        </p>
      </section>
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Datele unei solicitări
        </h2>
        <p className="text-steel mt-3">
          Când formularul este conectat la baza de date, stochează numele,
          adresa de email, telefonul opțional, subiectul, mesajul, metoda de
          contact preferată și referința configurației, dacă există. Datele sunt
          folosite numai pentru afișarea solicitării în zona protejată și, dacă
          este configurat, pentru notificarea proprietarului prin email.
        </p>
      </section>
      <section>
        <h2 className="font-heading text-3xl font-bold uppercase">
          Păstrare și control
        </h2>
        <p className="text-steel mt-3">
          Această versiune demonstrativă nu automatizează încă ștergerea,
          exportul sau anonimizarea datelor. Înaintea utilizării comerciale,
          proprietarul trebuie să stabilească o perioadă de păstrare, un canal
          pentru cererile persoanelor și date de contact juridice reale.
        </p>
      </section>
    </LegalPage>
  );
}
