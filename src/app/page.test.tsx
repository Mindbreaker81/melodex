import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the app title", () => {
    render(<Home />);
    expect(screen.getByText("Melodex")).toBeInTheDocument();
  });
});
