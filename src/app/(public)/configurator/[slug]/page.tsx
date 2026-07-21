import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConfiguratorExperience } from "@/components/configurator/configurator-experience";
import { getPublicConfigurator } from "@/data/queries/public-configurator";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const configurator = await getPublicConfigurator((await params).slug);
  return configurator
    ? {
        title: `Configurează ${configurator.catalogue.modelName}`,
        description: `Personalizează un VERIDIAN ${configurator.catalogue.modelName}, salvează configurația și solicită o ofertă cu preț recalculat pe server.`,
        alternates: {
          canonical: `/configurator/${configurator.model.slug}`,
        },
      }
    : {};
}

export default async function ModelConfiguratorPage({ params }: PageProps) {
  const configurator = await getPublicConfigurator((await params).slug);
  if (!configurator) notFound();

  return (
    <ConfiguratorExperience
      catalogue={configurator.catalogue}
      model={configurator.model}
    />
  );
}
