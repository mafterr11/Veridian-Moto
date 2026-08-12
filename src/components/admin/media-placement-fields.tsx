"use client";

import { useState } from "react";

import { AdminField } from "@/components/admin/form-field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

const mediaRoles = [
  ["card", "Card catalog"],
  ["hero", "Hero"],
  ["gallery", "Galerie"],
  ["configurator_base", "Bază configurator"],
  ["configurator_overlay", "Overlay configurator"],
] as const;

type MediaRole = (typeof mediaRoles)[number][0];

export type ConfiguratorChoiceItem = {
  id: string;
  code: string;
  name: string;
  status: string;
  groupStatus: string;
};

export function MediaPlacementFields({
  prefix,
  choices,
}: {
  prefix: string;
  choices: readonly ConfiguratorChoiceItem[];
}) {
  const [role, setRole] = useState<MediaRole>("gallery");
  const [choiceId, setChoiceId] = useState("");
  const usesConfiguratorChoice = role.startsWith("configurator_");
  const requiresChoice = role === "configurator_overlay";
  const choiceHint = !usesConfiguratorChoice
    ? "Disponibilă pentru baza și overlay-urile configuratorului."
    : choices.length
      ? requiresChoice
        ? "Obligatorie: alege piesa reprezentată de overlay."
        : "Opțională: leagă baza de un finisaj anume."
      : "Modelul nu are încă opțiuni active disponibile.";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminField label="Rol" htmlFor={`${prefix}-role`}>
        <NativeSelect
          id={`${prefix}-role`}
          name="role"
          value={role}
          className="w-full"
          onChange={(event) => {
            const nextRole = event.target.value as MediaRole;
            setRole(nextRole);
            if (!nextRole.startsWith("configurator_")) setChoiceId("");
          }}
        >
          {mediaRoles.map(([value, label]) => (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>

      <AdminField
        label="Opțiune configurator"
        htmlFor={`${prefix}-choice`}
        hint={choiceHint}
      >
        <NativeSelect
          id={`${prefix}-choice`}
          name="optionChoiceId"
          value={choiceId}
          className="w-full"
          disabled={!usesConfiguratorChoice}
          required={requiresChoice}
          onChange={(event) => setChoiceId(event.target.value)}
        >
          <NativeSelectOption value="">Fără opțiune</NativeSelectOption>
          {choices.map((choice) => (
            <NativeSelectOption key={choice.id} value={choice.id}>
              {choice.name} · {choice.code}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </AdminField>

      <AdminField label="Unghi" htmlFor={`${prefix}-angle`}>
        <Input
          id={`${prefix}-angle`}
          name="viewAngle"
          placeholder="front-three-quarter"
        />
      </AdminField>
      <AdminField label="Ordine" htmlFor={`${prefix}-sort`}>
        <Input
          id={`${prefix}-sort`}
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={0}
          required
        />
      </AdminField>
    </div>
  );
}
