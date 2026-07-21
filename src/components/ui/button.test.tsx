import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an accessible button with its label", () => {
    render(<Button>Configurează</Button>);

    expect(screen.getByRole("button", { name: "Configurează" })).toBeEnabled();
  });
});
