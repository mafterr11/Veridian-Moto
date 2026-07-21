import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminNav } from "@/components/admin/admin-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/atelier/descopera",
}));

describe("AdminNav", () => {
  it("uses one full-document request per admin navigation", () => {
    render(<AdminNav />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(8);

    for (const link of links) {
      expect(link).toHaveAttribute("data-admin-navigation", "document");
    }

    expect(screen.getByRole("link", { name: "Descoperă" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
