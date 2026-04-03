import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Stars from "./Stars";

describe("Stars", () => {
  afterEach(cleanup);

  it("renders correct number of earned stars via aria-label", () => {
    render(<Stars earned={2} total={3} />);
    expect(screen.getByLabelText("2 de 3 estrellas")).toBeInTheDocument();
  });

  it("renders correct total count of star elements", () => {
    render(<Stars earned={1} total={5} />);
    const container = screen.getByLabelText("1 de 5 estrellas");
    const stars = container.querySelectorAll("span");
    expect(stars).toHaveLength(5);
  });

  it("shows all dimmed when 0 earned", () => {
    render(<Stars earned={0} total={3} />);
    const container = screen.getByLabelText("0 de 3 estrellas");
    const stars = container.querySelectorAll("span");
    stars.forEach((star) => {
      expect(star.className).toContain("opacity-30");
    });
  });

  it("shows all golden when 3 earned out of 3", () => {
    render(<Stars earned={3} total={3} />);
    const container = screen.getByLabelText("3 de 3 estrellas");
    const stars = container.querySelectorAll("span");
    stars.forEach((star) => {
      expect(star.className).not.toContain("opacity-30");
    });
  });

  it("defaults to total=3", () => {
    render(<Stars earned={1} />);
    expect(screen.getByLabelText("1 de 3 estrellas")).toBeInTheDocument();
    const container = screen.getByLabelText("1 de 3 estrellas");
    const stars = container.querySelectorAll("span");
    expect(stars).toHaveLength(3);
  });
});
