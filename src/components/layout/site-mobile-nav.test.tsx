import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

import { SiteMobileNav } from "@/components/layout/site-mobile-nav";

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

function openMenu() {
  const details = screen.getByRole("group") as HTMLDetailsElement;
  details.open = true;
  fireEvent(details, new Event("toggle", { bubbles: false }));
  return details;
}

describe("SiteMobileNav", () => {
  it("closes after a navigation link inside the menu is clicked", () => {
    render(<SiteMobileNav />);
    const details = openMenu();
    expect(details.open).toBe(true);

    fireEvent.click(screen.getByRole("link", { name: /Modele/ }));

    expect(details.open).toBe(false);
  });

  it("closes after the configurator call to action is clicked", () => {
    render(<SiteMobileNav />);
    const details = openMenu();

    fireEvent.click(screen.getByRole("link", { name: "Configurează" }));

    expect(details.open).toBe(false);
  });

  it("closes on an outside pointer press and on Escape", () => {
    render(<SiteMobileNav />);
    const details = openMenu();

    fireEvent.pointerDown(document.body);
    expect(details.open).toBe(false);

    openMenu();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(details.open).toBe(false);
  });

  it("labels the trigger by state", () => {
    render(<SiteMobileNav />);
    expect(screen.getByLabelText("Deschide meniul")).toBeInTheDocument();

    openMenu();

    expect(screen.getByLabelText("Închide meniul")).toBeInTheDocument();
  });
});
