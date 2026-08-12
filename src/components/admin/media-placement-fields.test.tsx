import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaPlacementFields } from "@/components/admin/media-placement-fields";

const choices = [
  {
    id: "seat-comfort",
    code: "seat-comfort",
    name: "Șa Comfort",
    status: "published",
    groupStatus: "published",
  },
];

describe("MediaPlacementFields", () => {
  it("enables and requires a linked option only for configurator placements", () => {
    render(<MediaPlacementFields prefix="test" choices={choices} />);

    const role = screen.getByLabelText("Rol");
    const choice = screen.getByLabelText("Opțiune configurator");

    expect(choice).toBeDisabled();
    expect(choice).not.toBeRequired();

    fireEvent.change(role, { target: { value: "configurator_base" } });
    expect(choice).toBeEnabled();
    expect(choice).not.toBeRequired();

    fireEvent.change(role, { target: { value: "configurator_overlay" } });
    expect(choice).toBeRequired();
  });

  it("clears the linked option when switching to a non-configurator role", () => {
    render(<MediaPlacementFields prefix="test" choices={choices} />);

    const role = screen.getByLabelText("Rol");
    const choice = screen.getByLabelText("Opțiune configurator");

    fireEvent.change(role, { target: { value: "configurator_base" } });
    fireEvent.change(choice, { target: { value: "seat-comfort" } });
    expect(choice).toHaveValue("seat-comfort");

    fireEvent.change(role, { target: { value: "gallery" } });
    expect(choice).toBeDisabled();
    expect(choice).toHaveValue("");
  });
});
