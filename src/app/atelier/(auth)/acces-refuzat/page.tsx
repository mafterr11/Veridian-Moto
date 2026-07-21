import type { Metadata } from "next";
import { LogOut, ShieldX } from "lucide-react";

import { logoutAction } from "@/app/atelier/actions";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Acces refuzat" };

export default function AtelierAccessDeniedPage() {
  return (
    <main className="bg-porcelain text-obsidian grid min-h-svh place-items-center px-5 py-12">
      <section className="border-obsidian/15 w-full max-w-2xl border bg-white p-7 sm:p-10">
        <BrandMark />
        <ShieldX
          className="text-destructive mt-12 size-10"
          aria-hidden="true"
        />
        <p className="text-destructive mt-6 text-xs font-bold tracking-[0.18em] uppercase">
          Acces refuzat
        </p>
        <h1 className="font-heading mt-3 text-5xl leading-none font-extrabold uppercase sm:text-6xl">
          Contul nu are un profil Atelier activ.
        </h1>
        <p className="text-steel mt-5 max-w-xl text-sm leading-6">
          Autentificarea Supabase este validă, dar profilul administratorului
          lipsește sau este dezactivat. Verifică ADMIN_EMAIL și rulează din nou
          comanda de provisionare, apoi autentifică-te din nou.
        </p>
        <form action={logoutAction} className="mt-8">
          <Button type="submit">
            <LogOut aria-hidden="true" /> Ieși și revino la autentificare
          </Button>
        </form>
      </section>
    </main>
  );
}
